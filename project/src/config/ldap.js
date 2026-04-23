const ldap = require("ldapjs");
const env = require("./env");

function buildUserDn(instituteId) {
  return env.ldap.userDnTemplate.replace("{id}", instituteId);
}

async function verifyCredentials(instituteId, password) {
  if (env.ldap.mode === "mock") {
    if (env.ldap.mockAcceptAll) {
      return Boolean(password);
    }
    return Boolean(password) && password === env.ldap.mockPassword;
  }

  const client = ldap.createClient({ url: env.ldap.url });
  const userDn = buildUserDn(instituteId);

  return new Promise((resolve, reject) => {
    client.bind(userDn, password, (bindErr) => {
      client.unbind();
      if (bindErr) {
        reject(bindErr);
        return;
      }
      resolve(true);
    });
  });
}

module.exports = {
  verifyCredentials
};
