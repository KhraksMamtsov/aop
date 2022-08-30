export enum DCErrorCode {
  ERROR = "ERROR",
}

/**
 * Class for delete component errors
 */
export class DCError extends Error {
  /**
   * Set of possible error codes
   */
  public static ERROR_CODE = DCErrorCode;

  /**
   * Error code to indicate a specific error
   */
  public code: string;

  public constructor(message: string, code: string) {
    super(message);
    this.code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DCError.prototype);
  }
}
