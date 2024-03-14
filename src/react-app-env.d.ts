/// <reference types="react-scripts" />

type Size = "b" | "w" | "l";
type DataRegister = "D0" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7";
type AddressRegister = "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6";
type Register = DataRegister | AddressRegister;

type RegisterMap = Record<Register, number>;

type Opcode = {
  instruction: string;
  size?: Size;
};

type LiteralParam = {
  value: number;
};

// there are more, but going with this to start
// https://www.thedigitalcatonline.com/blog/2019/03/04/motorola-68000-addressing-modes/
type Mode =
  | "RegisterDirect"
  | "AddressRegisterIndirect"
  | "AddressRegisterIndirect_Postincrement"
  | "AddressRegisterIndirect_Predecrement"
  | "AddressRegisterIndirect_Displacement";

type RegisterParam = {
  register: Register;
  size?: Size;
  value: number;
  mode: Mode;
  destination: boolean;
};

type Param = LiteralParam | RegisterParam;

type TraceLine = {
  lineNumber: number;
  address: number;
  opcode: Opcode;
  params: Param[];
  rawParams: string[];
  registers: RegisterMap;
  rawLine: string;
  result?: number;
  comment?: string;
};

type Trace = TraceLine[];
