const fs = require('fs');
const core = require('@actions/core');

async function run() {
    try {
        const accessToken = core.getInput('accessToken');
        core.setSecret(accessToken);

        const server = core.getInput('server');
        const organization = core.getInput('organization');
        const feed = core.getInput('feed');
        core.setSecret(feed);
        let username = core.getInput('username');
        const email = core.getInput('email');

        let filePath = core.getInput('npmrcPath');

        if (username === undefined || username === '') {
            username = organization;
        }
        if (filePath === undefined || filePath === '') {
            filePath = `${process.env.HOME}/.npmrc`;
        }

        if (core.isDebug()) {
            core.debug(`AccessToken: ${accessToken}`);
        }
        core.info(`Organization: ${organization}`);
        if (core.isDebug()) {
            core.debug(`Organization: ${feed}`);
        }
        core.info(`Username: ${username}`);
        core.info(`Email: ${email}`);

        core.info(`Write to: ${filePath}`);

        const authTokenConfiguration = `
; begin auth token
//${server}/${organization}/_packaging/${feed}/npm/registry/:username=${username}
//${server}/${organization}/_packaging/${feed}/npm/registry/:_password=${accessToken}
//${server}/${organization}/_packaging/${feed}/npm/registry/:email=${email}
//${server}/${organization}/_packaging/${feed}/npm/:username=${username}
//${server}/${organization}/_packaging/${feed}/npm/:_password=${accessToken}
//${server}/${organization}/_packaging/${feed}/npm/:email=${email}
; end auth token  
`;

        fs.open(filePath, 'a', (error, fd) => {
            if (error) {
                core.setFailed(error.message);

                return;
            }

            fs.appendFile(fd, authTokenConfiguration, error => {
                if (error) {
                    core.setFailed(error.message);

                    return;
                }

                core.info('.npmrc configured');
                if (core.isDebug()) {
                    core.debug(`.nmprc content: ${authTokenConfiguration}`);
                }
            });
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

export default run;
