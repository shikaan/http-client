const EXCEPTION_TYPE = 'HTTPException'

export class HTTPException extends Error {
  static type = EXCEPTION_TYPE;

  status: number;
  message: string;
  type: string;
  details?: unknown;

  constructor(httpErrorDTO: { status: number; message: string; details?: unknown }) {
    super(httpErrorDTO.message);
    this.status = httpErrorDTO.status;
    this.message = httpErrorDTO.message;
    this.details = httpErrorDTO.details;
    this.type = HTTPException.type;
  }
}
