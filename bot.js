const { Wallet } = require("ethers");
const axios = require("axios");
const chalk = require("chalk");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const dotenv = require("dotenv");

dotenv.config();
wrapper(axios);

const cookieJar = new CookieJar();
const api = axios.create({
  baseURL: "https://launch.openverse.network",
  jar: cookieJar,
  withCredentials: true,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Origin: "https://launch.openverse.network",
    Referer: "https://launch.openverse.network/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  },
});

const privateKeys = process.env.PRIVATE_KEYS
  ? process.env.PRIVATE_KEYS.split(",")
  : [];
const referralCode = process.env.REFERRAL_CODE || "TTK5I6LN";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(wallet) {
  const address = wallet.address.toLowerCase();
  console.log(`[ℹ️] Wallet: ${chalk.yellow(address)}`);
  try {
    console.log(chalk.gray("  ├─ [🔒] Acquiring session token..."));
    await api.get("/sanctum/csrf-cookie");

    const messageToSign = "Sign-in";
    console.log(chalk.gray(`  ├─ [✍️] Signing message: "${messageToSign}"`));
    const signature = await wallet.signMessage(messageToSign);

    const payload = {
      address,
      referral_code: referralCode,
      sign: signature,
      kol_code: null,
    };
    const response = await api.post("/api/bindLogin", payload);

    if (response.data.res_code === 0 && response.data.data.access_token) {
      console.log(chalk.green("  └─ [✅] Login successful!"));
      return response.data.data.access_token;
    } else {
      console.log(
        chalk.red(
          `  └─ [❌] Login failed: ${response.data.res_msg || "Unknown error"}`
        )
      );
      return null;
    }
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.log(chalk.red(`  └─ [❌] Exception during login: ${errorMessage}`));
    return null;
  }
}

async function performTask(taskName, apiCall) {
  process.stdout.write(chalk.blue(`  │ [➡️]  ${taskName}... `));
  try {
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

async function getUserInfo(token, context = "Status") {
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

    const wallet = new Wallet(pk.startsWith("0x") ? pk : "0x" + pk);
    const accessToken = await login(wallet);

    if (accessToken) {
      await getUserInfo(accessToken, "Initial Status");

      console.log(chalk.cyan(`  │`));
      console.log(chalk.cyan(`  ┌─ [⚙️ Actions]`));

      await performTask("Checking in", () =>
        api.post(
          "/api/task/sign/done",
          { task_code: "daily_sign" },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      );
      await delay(1000);

      await performTask("Claiming tBTG", () =>
        api.post(
          "/api/fault/create",
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      );

      console.log(chalk.cyan(`  └──────────────────────────`));
      await delay(1000);

      await getUserInfo(accessToken, "Final Status");
    } else {
      console.error(
        chalk.red.bold(`\n[❌ FAIL] Could not process account ${index + 1}.`)
      );
    }

    if (index < privateKeys.length - 1) {
      await delay(5000);
    }
  }

  console.log(
    chalk.green.bold("\n\n🎉 All accounts have been processed. Bot finished.")
  );
}

main().catch((err) => {
  console.error("A fatal error occurred in the main process:", err);
});
