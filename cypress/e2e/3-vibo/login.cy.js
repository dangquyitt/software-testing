import "cypress-plugin-tab";

describe("Login", () => {
  const LOGIN_URL = "https://accounts.viblo.asia/login";
  const LOGIN_API = "https://accounts.viblo.asia/login";
  const VALID_USERNAME = "<your_username>";
  const VALID_PASSWORD = "<your_pasword>";

  beforeEach(() => {
    cy.visit(LOGIN_URL);
  });

  it("Kiểm tra các thành phần giao diện chính", () => {
    cy.get(".logo_0ce2aea").should("exist").and("be.visible");
    cy.contains("h5", "Đăng nhập vào Viblo").should("exist").and("be.visible");
    cy.get('input[placeholder="Tên người dùng hoặc email"]')
      .should("exist")
      .and("be.visible");
    cy.get('input[placeholder="Mật khẩu"]').should("exist").and("be.visible");
    cy.get('a[href="/forgot-password"]')
      .should("exist")
      .and("be.visible")
      .contains("Quên mật khẩu");
    cy.get('a[href="/register"]')
      .should("exist")
      .and("be.visible")
      .contains("Tạo tài khoản");
    cy.get(".el-button--primary")
      .contains("Đăng nhập")
      .should("exist")
      .and("be.visible");
    cy.contains("span", "Đăng nhập bằng").should("exist").and("be.visible");
    cy.get(".social-login__button.facebook")
      .should("exist")
      .and("be.visible")
      .contains("Facebook");
    cy.get(".social-login__button.google")
      .should("exist")
      .and("be.visible")
      .contains("Google");
    cy.get(".social-login__button.github")
      .should("exist")
      .and("be.visible")
      .contains("Github");
  });

  it("Kiểm tra màu nền, màu chữ, kích thước chữ của các thành phần", () => {
    cy.get("body").should("have.css", "background-color", "rgb(255, 255, 255)");
    cy.get("h5").should("have.css", "font-size", "20px");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').should(
      "have.css",
      "font-size",
      "14px"
    );
    cy.get("h5").should("have.css", "color", "rgb(48, 49, 51)");
  });

  it("Di chuyển con trỏ theo thứ tự hợp lý trên các trường input, button, và hyperlink", () => {
    const tabOrder = [
      'input[placeholder="Tên người dùng hoặc email"]',
      'input[placeholder="Mật khẩu"]',
      ".el-button--primary",
      'a[href="/forgot-password"]',
      'a[href="/register"]',
      ".social-login__button.facebook",
      ".social-login__button.google",
      ".social-login__button.github",
    ];

    tabOrder.forEach((selector, index) => {
      if (index === 0) {
        cy.get(selector).focus().should("have.focus");
      } else {
        cy.focused().tab();
        cy.get(selector).should("have.focus");
      }
    });
  });

  it("Di chuyển con trỏ theo thứ tự ngược khi nhấn Shift + Tab", () => {
    const reverseTabOrder = [
      ".social-login__button.github",
      ".social-login__button.google",
      ".social-login__button.facebook",
      'a[href="/register"]',
      'a[href="/forgot-password"]',
      ".el-button--primary",
      'input[placeholder="Mật khẩu"]',
      'input[placeholder="Tên người dùng hoặc email"]',
    ];

    cy.get(reverseTabOrder[0]).focus().should("have.focus");

    for (let i = 1; i < reverseTabOrder.length; i++) {
      cy.focused().tab({ shift: true });
      cy.get(reverseTabOrder[i]).should("have.focus");
    }
  });

  it("Kiểm tra giao diện khi thu nhỏ và phóng to", () => {
    cy.get(".el-card").should("be.visible");
    cy.document().trigger("keydown", { ctrlKey: true, key: "-" });
    cy.wait(1000);
    cy.get(".el-card").should("be.visible");
    cy.document().trigger("keydown", { ctrlKey: true, key: "+" });
    cy.wait(1000);
    cy.get(".el-card").should("be.visible");
  });

  it("Nhấn reload 5 lần liên tục", () => {
    for (let i = 0; i < 5; i++) {
      cy.reload();
      cy.wait(500);
      cy.get(".el-card").should("be.visible");
    }
  });

  it("Tên người dùng/email. Kiểm tra gửi yêu cầu đăng nhập khi nhập đúng phân lớp (1-30 ký tự)", () => {
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "tendangnhap"
    );
    cy.get('input[placeholder="Mật khẩu"]').type("matkhau");
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest").should("exist");
  });

  it("Tên người dùng/email. Kiểm tra gửi yêu cầu đăng nhập khi nhập dưới phân lớp (dưới 1 ký tự)", () => {
    cy.get('input[placeholder="Tên người dùng hoặc email"]').clear();
    cy.get('input[placeholder="Mật khẩu"]').type("validPassword");
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get(".el-button.el-button--primary").click();
    cy.get(".el-form-item__error")
      .should("be.visible")
      .and("contain", "Tên người dùng/email là bắt buộc");
    cy.wait(100);
    cy.get("@loginRequest").should("not.exist");
  });

  it("Tên người dùng/email. Kiểm tra gửi yêu cầu đăng nhập khi nhập trên phân lớp (trên 30 ký tự)", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "a".repeat(31)
    );
    cy.get('input[placeholder="Mật khẩu"]').type("validPassword");
    cy.get(".el-button.el-button--primary").click();
    cy.get(".el-form-item__error")
      .should("be.visible")
      .and("contain", "Tên người dùng/email không hợp lệ");
    cy.wait(100);
    cy.get("@loginRequest").should("not.exist");
  });

  it("Mật khẩu. Kiểm tra nhập đúng phân lớp (3-30 ký tự)", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "validUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').type("validPassword");
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest").its("response.statusCode").should("exist");
  });

  it("Mật khẩu. Kiểm tra nhập dưới phân lớp (dưới 3 ký tự)", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "validUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').type("ab");
    cy.get(".el-button.el-button--primary").click();
    cy.get(".el-form-item__error")
      .should("be.visible")
      .and("contain", "Mật khẩu không hợp lệ");
    cy.wait(100);
    cy.get("@loginRequest").should("not.exist");
  });

  it("Mật khẩu. Kiểm tra nhập trên phân lớp (trên 30 ký tự)", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "validUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').type("a".repeat(31));
    cy.get(".el-button.el-button--primary").click();
    cy.get(".el-form-item__error")
      .should("be.visible")
      .and("contain", "Mật khẩu không hợp lệ");
    cy.wait(100);
    cy.get("@loginRequest").should("not.exist");
  });

  it("Mật khẩu. Để trống trường và bấm đăng nhập", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "validUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').clear();
    cy.get(".el-button.el-button--primary").click();
    cy.get(".el-form-item__error")
      .should("be.visible")
      .and("contain", "Mật khẩu là bắt buộc");
    cy.wait(100);
    cy.get("@loginRequest").should("not.exist");
  });

  it("Đăng nhập thành công với tên người dùng/email và mật khẩu hợp lệ", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      VALID_USERNAME
    );
    cy.get('input[placeholder="Mật khẩu"]').type(VALID_PASSWORD);
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest").its("response.statusCode").should("equal", 200);
    cy.url().should("not.include", "/login");
  });

  it("Đăng nhập không thành công với tên người dùng/email hợp lệ và mật khẩu không hợp lệ", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      VALID_USERNAME
    );
    cy.get('input[placeholder="Mật khẩu"]').type("invalidPassword");
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest");
    cy.get(".el-alert__title")
      .should("be.visible")
      .and("contain", "Wrong username/email or password");
    cy.url().should("include", "/login");
  });

  it("Đăng nhập không thành công với tên người dùng/email không hợp lệ và mật khẩu hợp lệ", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "invalidUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').type(VALID_PASSWORD);
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest");
    cy.get(".el-alert__title")
      .should("be.visible")
      .and("contain", "Wrong username/email or password");
    cy.url().should("include", "/login");
  });

  it("Đăng nhập không thành công với tên người dùng/email và mật khẩu không hợp lệ", () => {
    cy.intercept("POST", LOGIN_API).as("loginRequest");
    cy.get('input[placeholder="Tên người dùng hoặc email"]').type(
      "invalidUsername"
    );
    cy.get('input[placeholder="Mật khẩu"]').type("invalidPassword");
    cy.get(".el-button.el-button--primary").click();
    cy.wait("@loginRequest");
    cy.get(".el-alert__title")
      .should("be.visible")
      .and("contain", "Wrong username/email or password");
    cy.url().should("include", "/login");
  });
});
