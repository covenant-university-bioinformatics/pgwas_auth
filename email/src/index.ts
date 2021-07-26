import { EmailNotifyListener } from "./events/email-notify-listener";
import { natsClient } from "./nats-client";

const run = async () => {
  console.log("Email service starting...");

  await natsClient.connect(
    process?.env?.NATS_CLUSTER_ID!,
    process?.env?.NATS_CLIENT_ID!,
    process?.env?.NATS_URL!
  );

  natsClient.client.on("close", () => {
    console.log("NATS connection closed!");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    natsClient.client.close();
  });

  process.on("SIGTERM", () => {
    natsClient.client.close();
  });

  process.on("SIGBREAK", () => {
    natsClient.client.close();
  });

  const emailNotifyListener = new EmailNotifyListener(natsClient.client);
  emailNotifyListener.listen();
};

run();
