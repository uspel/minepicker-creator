import chalk, { ForegroundColorName } from "chalk";

export default function message(
  message: string,
  type?: "success" | "failure" | "warning" | "update" | "addition" | "deletion" | "information",
  scope?: string
) {
  let icon: string = "";
  let color: ForegroundColorName = "white";
  let colorBright: ForegroundColorName = "whiteBright";
  let method: keyof Console = "log";

  switch (type) {
    case "information":
      icon = "i";
      color = "blue";
      colorBright = "blueBright";
      break;
    case "failure":
      icon = "✕";
      color = "red";
      colorBright = "redBright";
      method = "error";
      break;
    case "warning":
      icon = "⚠";
      color = "yellow";
      colorBright = "yellowBright";
      method = "warn";
      break;
    case "success":
      icon = "✓";
      color = "green";
      colorBright = "greenBright";
      break;
    case "update":
      icon = "↻";
      color = "blue";
      colorBright = "blueBright";
      break;
    case "addition":
      icon = "+";
      color = "green";
      colorBright = "greenBright";
      break;
    case "deletion":
      icon = "-";
      color = "red";
      colorBright = "redBright";
      break;
    default:
  }

  message = message.replace(/\*([^*]+)\*/g, chalk[colorBright]("$1"));

  if (icon) message = `${icon} ${message}`;

  let msg = "";
  if (scope) msg += chalk.white(`[${scope}] `);
  msg += chalk[color](message);

  console[method](msg);
}
