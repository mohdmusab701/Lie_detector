const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const devRoutes = require("./routes/devRoutes");
const detectionRoutes = require("./routes/detectionRoutes");
const newsRoutes = require("./routes/newsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let httpServer = null;

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "SIGHTENGINE_API_USER",
  "SIGHTENGINE_API_SECRET",
  "GNEWS_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];

function getAllowedOrigins() {
  return [
    "http://localhost:5173",
    "https://lie-detector-xi.vercel.app",
  ];
}

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error(`CORS origin not allowed: ${origin}`);
    error.statusCode = 403;
    error.publicMessage = "CORS origin not allowed.";
    callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

function validateStartupEnv() {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
}

function getMongoReadyState() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || `unknown (${mongoose.connection.readyState})`;
}

function redactMongoUri(uri) {
  const protocolMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/i);
  if (!protocolMatch) return "<invalid-mongodb-uri>";

  const [, protocol, remainder] = protocolMatch;
  const suffixStart = remainder.search(/[/?#]/);
  const authority = suffixStart === -1 ? remainder : remainder.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : remainder.slice(suffixStart);
  const credentialEnd = authority.lastIndexOf("@");
  const hosts = credentialEnd === -1 ? authority : authority.slice(credentialEnd + 1);
  const redactedAuth = credentialEnd === -1 ? "" : "<credentials>@";
  const databaseAndQuery = suffix.replace(/([?&](?:authSource|replicaSet|retryWrites|w|appName)=)[^&]*/gi, "$1<set>");

  return `${protocol}${redactedAuth}${hosts}${databaseAndQuery}`;
}

function validateMongoUri(uri) {
  const normalizedUri = typeof uri === "string" ? uri.trim() : "";

  if (!normalizedUri) {
    throw new Error("MONGO_URI is empty.");
  }

  if (normalizedUri !== uri) {
    throw new Error("MONGO_URI has leading or trailing whitespace. Remove the extra spaces in Render.");
  }

  if (normalizedUri.includes("your_mongodb_connection_string")) {
    throw new Error("MONGO_URI still contains the placeholder value.");
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(normalizedUri)) {
    throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://.");
  }

  if (/\s/.test(normalizedUri)) {
    throw new Error("MONGO_URI contains whitespace. Check the Render environment variable value.");
  }

  let parsedUri;
  try {
    parsedUri = new URL(normalizedUri);
  } catch (error) {
    throw new Error(`MONGO_URI is malformed: ${error.message}`);
  }

  if (!parsedUri.hostname) {
    throw new Error("MONGO_URI is missing the MongoDB host.");
  }

  if (parsedUri.protocol === "mongodb+srv:" && parsedUri.hostname.includes(":")) {
    throw new Error("mongodb+srv URI must not include a port number.");
  }

  const databaseName = parsedUri.pathname.replace("/", "");
  if (!databaseName) {
    console.warn("MongoDB URI does not include a database name. Mongoose will use the driver's default database.");
  }

  const authority = normalizedUri.slice(normalizedUri.indexOf("://") + 3).split(/[/?#]/)[0];
  const lastAtIndex = authority.lastIndexOf("@");
  if (lastAtIndex !== -1) {
    const userInfo = authority.slice(0, lastAtIndex);
    const password = userInfo.includes(":") ? userInfo.slice(userInfo.indexOf(":") + 1) : "";

    if (password && /[@/?#[\]]/.test(password)) {
      console.warn(
        "MongoDB password appears to contain unencoded reserved characters. Encode special characters such as @, /, ?, #, [, and ] in the Atlas password."
      );
    }
  }

  return {
    databaseName: databaseName || "(default)",
    isSrv: parsedUri.protocol === "mongodb+srv:",
    sanitizedUri: redactMongoUri(normalizedUri),
    uri: normalizedUri,
  };
}

function registerMongoEventLogging() {
  mongoose.connection.on("connecting", () => {
    console.info(`MongoDB connecting. readyState=${getMongoReadyState()}`);
  });

  mongoose.connection.on("connected", () => {
    console.info(`MongoDB connected. host=${mongoose.connection.host || "unknown"} db=${mongoose.connection.name || "unknown"}`);
  });

  mongoose.connection.on("open", () => {
    console.info(`MongoDB connection open. readyState=${getMongoReadyState()}`);
  });

  mongoose.connection.on("reconnected", () => {
    console.info(`MongoDB reconnected. readyState=${getMongoReadyState()}`);
  });

  mongoose.connection.on("disconnecting", () => {
    console.warn(`MongoDB disconnecting. readyState=${getMongoReadyState()}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn(`MongoDB disconnected. readyState=${getMongoReadyState()}. Mongoose will attempt to reconnect unless the process is shutting down.`);
  });

  mongoose.connection.on("error", (error) => {
    console.error(
      "MongoDB connection error:",
      JSON.stringify({
        name: error.name,
        message: error.message,
        code: error.code || null,
        reason: error.reason?.message || null,
        readyState: getMongoReadyState(),
      })
    );
  });
}

function registerMongoDriverLogging() {
  const client = mongoose.connection.getClient();
  if (!client) return;

  client.on("serverHeartbeatFailed", (event) => {
    console.error(
      "MongoDB heartbeat failed:",
      JSON.stringify({
        connectionId: event.connectionId,
        failure: event.failure?.message || String(event.failure),
      })
    );
  });
}

async function shutdown(signal) {
  console.info(`${signal} received. Closing HTTP server and MongoDB connection.`);

  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }

    await mongoose.connection.close(false);
    console.info("MongoDB connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error(`${signal} shutdown error:`, error.message);
    process.exit(1);
  }
}

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use("/api", authRoutes);
app.use("/api", contactRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", devRoutes);
app.use("/api", detectionRoutes);
app.use("/api", newsRoutes);
app.use("/api", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "AI Lie Detector backend" });
});

app.use((err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.publicMessage || err.message || "Something went wrong while processing the upload.";

  if (err.code === 11000 && err.keyPattern?.email) {
    status = 409;
    message = "An account with this email already exists.";
  }

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(" ");
  }

  res.status(status).json({
    success: false,
    message,
  });
});

async function startServer() {
  try {
    validateStartupEnv();
    registerMongoEventLogging();

    const mongoConfig = validateMongoUri(process.env.MONGO_URI);
    console.info(
      "MongoDB connection config:",
      JSON.stringify({
        databaseName: mongoConfig.databaseName,
        isSrv: mongoConfig.isSrv,
        uri: mongoConfig.sanitizedUri,
      })
    );

    await mongoose.connect(mongoConfig.uri, {
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    registerMongoDriverLogging();

    httpServer = app.listen(PORT, () => {
      console.log(`AI Lie Detector backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup error:", error.message);
    process.exit(1);
  }
}

startServer();

process.once("SIGINT", () => {
  shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
