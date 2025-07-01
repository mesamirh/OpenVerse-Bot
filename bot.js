const { Wallet } = require("ethers");
const axios = require("axios");
const chalk = require("chalk");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const dotenv = require("dotenv");

dotenv.config();
wrapper(axios);

const privateKeys = process.env.PRIVATE_KEYS
  ? process.env.PRIVATE_KEYS.split(",")
  : [];
const referralCode = process.env.REFERRAL_CODE || "TTK5I6LN";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = (min = 1000, max = 3000) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};

function createApiInstance() {
  const cookieJar = new CookieJar();
  return axios.create({
    baseURL: "https://launch.openverse.network",
    jar: cookieJar,
    withCredentials: true,
    timeout: 30000,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Origin: "https://launch.openverse.network",
      Referer: "https://launch.openverse.network/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
  });
}

async function login(wallet, api, retries = 3) {
  const address = wallet.address.toLowerCase();
  console.log(`[ℹ️] Wallet: ${chalk.yellow(address)}`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(chalk.gray("  ├─ [🔒] Acquiring session token..."));
      await api.get("/sanctum/csrf-cookie");

      await randomDelay(500, 1500);

      const messageToSign = "Sign-in";
      console.log(chalk.gray(`  ├─ [✍️] Signing message: "${messageToSign}"`));
      const signature = await wallet.signMessage(messageToSign);

      const payload = {
        address,
        referral_code: referralCode,
        sign: signature,
        kol_code: null,
      };

      await randomDelay(500, 1500);
      const response = await api.post("/api/bindLogin", payload);

      if (response.data.res_code === 0 && response.data.data.access_token) {
        console.log(chalk.green("  └─ [✅] Login successful!"));
        return response.data.data.access_token;
      } else {
        throw new Error(response.data.res_msg || "Unknown error");
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.status === 404
          ? "Server returned 404 - possibly rate limited"
          : JSON.stringify(error.response.data)
        : error.message;

      if (attempt < retries) {
        console.log(
          chalk.yellow(`  ├─ [⚠️] Attempt ${attempt} failed: ${errorMessage}`)
        );
        console.log(
          chalk.yellow(`  ├─ [🔄] Retrying in ${attempt * 5} seconds...`)
        );
        await delay(attempt * 5000);
      } else {
        console.log(
          chalk.red(`  └─ [❌] All ${retries} attempts failed: ${errorMessage}`)
        );
        return null;
      }
    }
  }
}

async function performTask(taskName, apiCall) {
  process.stdout.write(chalk.blue(`  │ [➡️]  ${taskName}... `));
  try {
    await randomDelay(500, 1500);
    const response = await apiCall();
    if (response.data.res_code === 0) {
      let details = "Success!";
      if (response.data.data.user_reward_point > 0) {
        details = `+${response.data.data.user_reward_point} points!`;
      } else if (response.data.res_msg.includes("got tBTG")) {
        details = "Claimed tBTG!";
      }
      process.stdout.write(chalk.green(`[✅] ${details}\n`));
    } else {
      process.stdout.write(
        chalk.yellow(`[⚠️] ${response.data.res_msg || "Already done?"}\n`)
      );
    }
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : "Unknown error";
    process.stdout.write(chalk.red(`[❌] Failed: ${errorMessage}\n`));
  }
}

async function getUserInfo(token, api, context = "Status") {
  try {
    const response = await api.get("/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.address) {
      const user = response.data;
      const addressShort = `${user.address.slice(0, 6)}...${user.address.slice(
        -4
      )}`;

      console.log(chalk.cyan(`  │`));
      console.log(chalk.cyan(`  ┌─ [👤 ${context}]`));
      console.log(chalk.cyan(`  │  Wallet: ${chalk.yellow(addressShort)}`));
      console.log(chalk.cyan(`  │  Points: ${chalk.yellowBright(user.point)}`));
      console.log(
        chalk.cyan(
          `  │  tBTG:   ${chalk.yellowBright(user.test_bitgold_balance)}`
        )
      );
      console.log(chalk.cyan(`  └──────────────────────────`));
    } else {
      console.log(chalk.yellow("  │ [⚠️] Could not fetch user info."));
    }
  } catch (error) {
    console.log(chalk.red("  │ [❌] Exception fetching user info."));
  }
}

async function main() {
  console.clear();
  const boxen = (text) => {
    const line = "─".repeat(text.length + 2);
    console.log(chalk.magenta(`┌${line}┐`));
    console.log(chalk.magenta(`│ ${text} │`));
    console.log(chalk.magenta(`└${line}┘`));
  };
  boxen("🚀 OpenVerse Automation Bot");

  if (privateKeys.length === 0 || !privateKeys[0]) {
    console.error(
      chalk.red.bold("\n[🚨 FATAL] No private keys found in .env file.")
    );
    return;
  }

  console.log(
    chalk.blue(`\n[ℹ️] Found ${privateKeys.length} account(s) to process.`)
  );

  for (const [index, pk] of privateKeys.entries()) {
    console.log(chalk.gray(`\n- - - - - - - - - - - - - - - - - - - - - -`));
    console.log(
      chalk.cyan.bold(
        `✨ Processing Account ${index + 1} of ${privateKeys.length}`
      )
    );
    console.log(chalk.gray(`- - - - - - - - - - - - - - - - - - - - - -`));

    const api = createApiInstance();

    const wallet = new Wallet(pk.startsWith("0x") ? pk : "0x" + pk);
    const accessToken = await login(wallet, api);

    if (accessToken) {
      await getUserInfo(accessToken, api, "Initial Status");

      console.log(chalk.cyan(`  │`));
      console.log(chalk.cyan(`  ┌─ [⚙️ Actions]`));

      await performTask("Checking in", () =>
        api.post(
          "/api/task/sign/done",
          { task_code: "daily_sign" },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      );

      await randomDelay(2000, 4000);

      await performTask("Claiming tBTG", () =>
        api.post(
          "/api/fault/create",
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      );

      console.log(chalk.cyan(`  └──────────────────────────`));
      await randomDelay(1000, 2000);

      await getUserInfo(accessToken, api, "Final Status");
    } else {
      console.error(
        chalk.red.bold(`\n[❌ FAIL] Could not process account ${index + 1}.`)
      );
    }

    if (index < privateKeys.length - 1) {
      const delayTime = Math.floor(Math.random() * 10000) + 10000;
      console.log(
        chalk.gray(`\n[⏳] Waiting ${delayTime / 1000}s before next account...`)
      );
      await delay(delayTime);
    }
  }

  console.log(
    chalk.green.bold("\n\n🎉 All accounts have been processed. Bot finished.")
  );
}

main().catch((err) => {
  console.error("A fatal error occurred in the main process:", err);
});
