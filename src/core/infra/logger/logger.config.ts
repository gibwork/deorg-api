export class LoggerConfig {
  static getDefaultLoggerTimezoned() {
    return () => {
      return new Date().toLocaleString();
    };
  }

  static getTimes() {
    return {
      FIVE_SECONDS: 5_000,
      TEN_MINUTES: 600_000,
      FIFTEEN_MINUTES: 900_000,
    };
  }
}
