class Cookie extends Date {
  private cookieName: string;
  private expires: string | undefined;

  constructor(cookieName: string) {
    super();
    this.cookieName = cookieName;
  }
  set(cookieValue: any, expDays: any) {
    super.setTime(super.getTime() + expDays * 24 * 60 * 60 * 1000);
    this.expires = "expires=" + super.toUTCString();
    document.cookie =
      this.cookieName + "=" + cookieValue + ";" + this.expires + ";path=/";
  }

  remove() {
    super.setTime(super.getTime());
    this.expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = this.cookieName + "=" + ";" + this.expires + ";path=/";
  }
}
