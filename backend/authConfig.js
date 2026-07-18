const passportConfig = {
    credentials: {
        tenantID: "691f6e87-f236-4be9-a9da-894ffbeb16ef",
        clientID: "51578f82-653c-4e5b-bca0-d805e361f14b"
    },
    metadata: {
        authority: "login.microsoftonline.com",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    settings: {
        validateIssuer: true,
        passReqToCallback: true,
        loggingLevel: "info",
        loggingNoPII: true,
    },
    protectedRoutes: {
        todolist: {
            endpoint: "/api/todolist",
            delegatedPermissions: {
                read: ["Todolist.Read", "Todolist.ReadWrite"],
                write: ["Todolist.ReadWrite"]
            },
            applicationPermissions: {
                read: ["Todolist.Read.All", "Todolist.ReadWrite.All"],
                write: ["Todolist.ReadWrite.All"]
            }
        },
        bookings: {
            endpoint: "/bookings",
            delegatedPermissions: {
                read: ["Bookings.Read", "Bookings.ReadWrite"],
                write: ["Bookings.ReadWrite"]
            },
            applicationPermissions: {
                read: ["Bookings.Read.All", "Bookings.ReadWrite.All"],
                write: ["Bookings.ReadWrite.All"]
            }
        }
    }
}

module.exports = passportConfig;