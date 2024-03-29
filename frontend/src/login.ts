import APIError from "./api/error";
import Client from "./api/wrapper/client";

const MAX_AGE = 2147483647;

function welcomeToLogin() {
    $("#welcome-screen").addClass("d-none");
    $("#email-screen").addClass("d-none");
    $("#login-screen").removeClass("d-none");
    $("#main-content").addClass("d-none");
}

function loginToEmailVerify() {
    $("#welcome-screen").addClass("d-none");
    $("#email-screen").removeClass("d-none");
    $("#login-screen").addClass("d-none");
    $("#main-content").addClass("d-none");
}

function emailToMain() {
    $("#welcome-screen").addClass("d-none");
    $("#email-screen").addClass("d-none");
    $("#login-screen").addClass("d-none");
    $("#main-content").removeClass("d-none");
}

export async function setupAndGetClient(): Promise<Client> {
    // Setup events for welcome and login screen
    if (document.cookie.indexOf("welcomed=") > -1) {
        welcomeToLogin();
    } else {
        $("#continue").on("click", () => {
            document.cookie = `welcomed=; Secure; Max-Age=${MAX_AGE}`
            welcomeToLogin();
        });
    }

    const client = new Client();

    try {
        // Is already logged-in?
        await client.api.auth.me();
    } catch (e) {
        // Auto auth did not work. Go through login.
        if (e instanceof APIError) {
            await handleLoginOrRegister(client);
        }
    }

    // Yes
    loginToEmailVerify();

    if (!client.api.auth.dataMe.verified_email) {;
        await handleEmailVerification(client);
    }

    emailToMain();

    return client;

}

function handleLoginOrRegister(client: Client): Promise<Client> {
    $("#register-error").hide();
    $("#login-error").hide()
    return new Promise((resolve, reject) => {
        $("#login-button").on("click", async (event) => {
            try {
                await client.login(
                    $("#login-email-input").val() as string,
                    $("#login-password-input").val() as string
                );

                resolve(client);
            } catch (e) {
                if (e instanceof APIError) {
                    $("#login-error").text(e.message.error).show()
                    setTimeout(() => {
                        $("#login-error").hide()
                    }, 3000);
                }
            }
        });

        $("#register-button").on("click", async (event) => {
            try {
                await client.register(
                    $("#register-name-input").val() as string,
                    $("#register-email-input").val() as string,
                    $("#register-password-input").val() as string,
                    $("#register-confirm-password-input").val() as string,
                );

                resolve(client);
            } catch (e) {
                if (e instanceof APIError) {
                    $("#register-error").text(e.message.error).show()
                    setTimeout(() => {
                        $("#register-error").hide()
                    }, 3000);
                }
            }
        });
    })
}

function handleEmailVerification(client: Client) {
    $("#email-error").hide();
    return new Promise((resolve, reject) => {
        $("#logout-email-verification").on("click", async () => {
            await client.logout();
            location.reload();
        });

        $("#send-email-verification").on("click", async () => {
            try {
                await client.sendVerificationEmail();
                $("#email-info").text("An email was sent at {0}".formatUnicorn((new Date()).toLocaleString()))
            } catch (e) {
                if (e instanceof APIError) {
                    $("#email-error").text(e.message.error).show()
                    setTimeout(() => {
                        $("#email-error").hide()
                    }, 3000);
                }
            }
        });
    });
}