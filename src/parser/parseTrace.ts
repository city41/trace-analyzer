const BYTE_MASK = 0xff;
const WORD_MASK = 0xffff;
const LONG_MASK = 0xffffffff;

const sizeToMask: Record<Size, number> = {
  b: BYTE_MASK,
  w: WORD_MASK,
  l: LONG_MASK,
};

function isRegisterParam(o: unknown): o is RegisterParam {
  if (typeof o !== "object" || o === null) {
    return false;
  }

  const param = o as RegisterParam;

  return typeof param.value === "number" && typeof param.register === "string";
}

function createRegisterMap(rawRegisters: string): RegisterMap {
  const registerPairs = rawRegisters.split(" ");

  return registerPairs.reduce<Partial<RegisterMap>>((accum, rp) => {
    const [reg, val] = rp.split("=");

    return {
      ...accum,
      [reg]: parseInt(val, 16),
    };
  }, {}) as RegisterMap;
}

function removeDuplicateSpaces(s: string): string {
  return s.replace(/\s+/g, " ");
}

function parseOpcode(rawOpcode: string): Opcode {
  const [instruction, size] = rawOpcode.split(".");

  return {
    instruction,
    size: size as Size | undefined,
  };
}

function parseLiteral(rawLiteral: string): number {
  const multiplier = rawLiteral.startsWith("-") ? -1 : 1;

  // -$8000 -> 8000
  rawLiteral = rawLiteral.replace(/-?\$/, "");

  return parseInt(rawLiteral, 16) * multiplier;
}

function parseRegister(
  rawRegister: string,
  registerMap: RegisterMap
): number | undefined {
  const [reg, sizeModifier] = rawRegister.split(".");

  const regValue = registerMap[reg as Register];

  if (regValue === undefined) {
    return undefined;
  }

  const sizeMask = sizeToMask[sizeModifier as Size] ?? LONG_MASK;

  return regValue & sizeMask;
}

function parseParam(
  rawParam: string,
  position: number,
  total: number,
  opcode: Opcode,
  registerMap: RegisterMap
): Param {
  rawParam = rawParam.replace(/,$/, "");

  const opcodeSizeMask =
    position === 1 && opcode.size ? sizeToMask[opcode.size] : LONG_MASK;

  // D0, A2, etc
  if (typeof registerMap[rawParam as Register] === "number") {
    return {
      destination: position === total,
      mode: "RegisterDirect",
      register: rawParam as Register,
      value: registerMap[rawParam as Register],
    };
  }

  // (A0), (-$8000,A5), (A1,D7.w)
  if (rawParam.startsWith("(") && rawParam.endsWith(")")) {
    // chop off the parens
    rawParam = rawParam.replace(/[\)\(]/g, "");

    if (rawParam.includes(",")) {
      // (-$8000,A5) or (A1,D7.w)
      const [rawLeft, rawRight] = rawParam.split(",");
      const left = parseRegister(rawLeft, registerMap) ?? parseLiteral(rawLeft);
      const right =
        parseRegister(rawRight, registerMap) ?? parseLiteral(rawRight);

      return {
        destination: false,
        mode: "AddressRegisterIndirect_Displacement",
        register: rawRight as Register,
        value: left + right,
      };
    } else {
      // (A0)
      const value = parseRegister(rawParam, registerMap);

      if (value === undefined) {
        throw new Error(`Failed to find a value for ${rawParam}`);
      }

      return {
        destination: false,
        mode: "AddressRegisterIndirect",
        register: rawParam as Register,
        value,
      };
    }
  }

  return {
    value: parseLiteral(rawParam),
  };
}

function parseLine(
  lineNumber: number,
  rawLine: string,
  nextRawLine: string
): TraceLine {
  rawLine = removeDuplicateSpaces(rawLine);
  nextRawLine = removeDuplicateSpaces(nextRawLine);

  const [line, comment] = rawLine.split(" ; ");
  const [rawRegisters, rawAsm] = line.split(" -- ");
  const [rawAddress, rawOpcode, ...rawParams] = rawAsm.split(" ");

  const registerMap = createRegisterMap(rawRegisters);

  const opcode = parseOpcode(rawOpcode);

  const params = rawParams.map((p, i, a) => {
    return parseParam(p, i + 1, a.length, opcode, registerMap);
  });

  const lastParam = params[params.length - 1];

  let result = undefined;
  if (isRegisterParam(lastParam) && lastParam.destination) {
    const [nextRawRegisters] = nextRawLine.split(" -- ");
    const nextRegisterMap = createRegisterMap(nextRawRegisters);
    result = nextRegisterMap[lastParam.register];
  }

  return {
    address: parseInt(rawAddress.replace(":", ""), 16),
    lineNumber,
    opcode,
    params,
    rawParams,
    rawLine,
    comment,
    registers: registerMap,
    result,
  };
}

function parseTrace(rawTrace: string[]): Trace {
  const trace: Trace = [];

  for (let i = 0; i < rawTrace.length - 1; ++i) {
    const traceLine = parseLine(i + 1, rawTrace[i], rawTrace[i + 1]);
    trace.push(traceLine);
  }
  return trace;
}

export { parseTrace };
