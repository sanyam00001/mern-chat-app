const fs = require("fs");
const path = require("path");
const { io } = require("../../client/node_modules/socket.io-client");

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";
const stamp = Date.now();

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const parseCookie = (res) => {
  const raw = res.headers.getSetCookie?.() || [];
  return raw.map((part) => part.split(";")[0]).join("; ");
};

const request = async (method, urlPath, { cookie, json, form, responseType } = {}) => {
  const headers = {};

  if (cookie) {
    headers.Cookie = cookie;
  }

  let body;

  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }

  const res = await fetch(`${API}${urlPath}`, { method, headers, body });
  const nextCookie = parseCookie(res) || cookie;
  let data = null;

  if (responseType === "buffer") {
    data = Buffer.from(await res.arrayBuffer());
  } else {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  }

  return { res, data, cookie: nextCookie };
};

const waitFor = (socket, event, timeoutMs = 8000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, onEvent);
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeoutMs);

    const onEvent = (payload) => {
      clearTimeout(timer);
      socket.off(event, onEvent);
      resolve(payload);
    };

    socket.on(event, onEvent);
  });

const connectSocket = (cookie) =>
  new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      extraHeaders: { Cookie: cookie },
      transports: ["websocket"],
    });

    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (error) => reject(error));
  });

(async () => {
  const results = [];
  const assert = (name, condition, detail = "") => {
    results.push({ name, ok: Boolean(condition), detail });
    const mark = condition ? "PASS" : "FAIL";
    console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
  };

  const password = "testpass123";
  const userA = await request("POST", "/auth/register", {
    json: { name: "Step7 UserA", email: `step7a.${stamp}@example.com`, password },
  });
  const userB = await request("POST", "/auth/register", {
    json: { name: "Step7 UserB", email: `step7b.${stamp}@example.com`, password },
  });
  const userC = await request("POST", "/auth/register", {
    json: { name: "Step7 UserC", email: `step7c.${stamp}@example.com`, password },
  });

  assert("register user A", userA.res.status === 201, userA.data?.email || userA.data?.message);
  assert("register user B", userB.res.status === 201, userB.data?.email || userB.data?.message);
  assert("register user C", userC.res.status === 201, userC.data?.email || userC.data?.message);

  const cookieA = userA.cookie;
  const cookieB = userB.cookie;
  const cookieC = userC.cookie;

  const conversation = await request("POST", "/chat/conversations", {
    cookie: cookieA,
    json: { recipientId: userB.data._id },
  });
  assert(
    "create conversation A-B",
    conversation.res.status === 200 && conversation.data?._id,
    conversation.data?._id || conversation.data?.message
  );

  const conversationId = conversation.data._id;
  const socketB = await connectSocket(cookieB);
  socketB.emit("conversation:join", { conversationId });

  const textWait = waitFor(socketB, "message:new");
  const textMessage = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    json: { content: "Step 7 text message" },
  });
  const textRealtime = await textWait;
  assert("send text message", textMessage.res.status === 201, textMessage.data?._id);
  assert(
    "user B receives text in real time",
    textRealtime?._id === textMessage.data._id && textRealtime.content === "Step 7 text message"
  );

  const imageWait = waitFor(socketB, "message:new");
  const imageForm = new FormData();
  imageForm.append(
    "file",
    new Blob([PNG_1X1], { type: "application/octet-stream" }),
    "photo.png"
  );
  imageForm.append("content", "Look at this image");
  const imageMessage = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    form: imageForm,
  });
  const imageRealtime = await imageWait;
  assert(
    "send image message",
    imageMessage.res.status === 201 && imageMessage.data.messageType === "image",
    imageMessage.data?.messageType || imageMessage.data?.message
  );
  assert(
    "user B receives image in real time",
    imageRealtime?._id === imageMessage.data._id && imageRealtime.messageType === "image"
  );

  const fileWait = waitFor(socketB, "message:new");
  const fileForm = new FormData();
  fileForm.append(
    "file",
    new Blob(["hello step 7 file"], { type: "application/octet-stream" }),
    "notes.txt"
  );
  const fileMessage = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    form: fileForm,
  });
  const fileRealtime = await fileWait;
  assert(
    "send file message",
    fileMessage.res.status === 201 && fileMessage.data.messageType === "file",
    fileMessage.data?.messageType || fileMessage.data?.message
  );
  assert(
    "user B receives file in real time",
    fileRealtime?._id === fileMessage.data._id &&
      fileRealtime.attachment?.originalName === "notes.txt"
  );

  const persisted = await request("GET", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieB,
  });
  const ids = (persisted.data?.messages || []).map((item) => item._id);
  assert(
    "messages persist after fetch",
    ids.includes(textMessage.data._id) &&
      ids.includes(imageMessage.data._id) &&
      ids.includes(fileMessage.data._id)
  );

  const imageDownload = await request("GET", `/chat/messages/${imageMessage.data._id}/attachment`, {
    cookie: cookieB,
    responseType: "buffer",
  });
  assert(
    "participant can access image attachment",
    imageDownload.res.status === 200 && imageDownload.data.equals(PNG_1X1)
  );

  const unauthorized = await request("GET", `/chat/messages/${imageMessage.data._id}/attachment`, {
    cookie: cookieC,
    responseType: "buffer",
  });
  const unauthorizedBody = unauthorized.data.toString("utf8");
  assert(
    "unauthorized user cannot access attachment",
    unauthorized.res.status === 403,
    unauthorizedBody.slice(0, 120)
  );

  const unauthenticated = await request("GET", `/chat/messages/${imageMessage.data._id}/attachment`, {
    responseType: "buffer",
  });
  assert("unauthenticated cannot access attachment", unauthenticated.res.status === 401);

  const invalidForm = new FormData();
  invalidForm.append(
    "file",
    new Blob([Buffer.from("MZ")], { type: "application/x-msdownload" }),
    "malware.exe"
  );
  const invalidType = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    form: invalidForm,
  });
  assert(
    "reject invalid file type",
    invalidType.res.status === 400,
    invalidType.data?.message
  );

  const spoofForm = new FormData();
  spoofForm.append(
    "file",
    new Blob([Buffer.from("MZ executable")], { type: "image/png" }),
    "spoofed.png"
  );
  const spoofed = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    form: spoofForm,
  });
  assert(
    "reject MIME/extension spoofing",
    spoofed.res.status === 400,
    spoofed.data?.message
  );

  const oversizedForm = new FormData();
  oversizedForm.append(
    "file",
    new Blob([Buffer.alloc(10 * 1024 * 1024 + 2048)], { type: "text/plain" }),
    "huge.txt"
  );
  const oversized = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieA,
    form: oversizedForm,
  });
  assert(
    "reject oversized file",
    oversized.res.status === 400,
    oversized.data?.message
  );

  const missingConversation = await request(
    "POST",
    `/chat/conversations/000000000000000000000000/messages`,
    {
      cookie: cookieA,
      json: { content: "should fail" },
    }
  );
  assert(
    "upload/send failure for missing conversation",
    missingConversation.res.status === 404,
    missingConversation.data?.message
  );

  const outsiderUpload = new FormData();
  outsiderUpload.append(
    "file",
    new Blob([PNG_1X1], { type: "image/png" }),
    "intruder.png"
  );
  const outsider = await request("POST", `/chat/conversations/${conversationId}/messages`, {
    cookie: cookieC,
    form: outsiderUpload,
  });
  assert(
    "non-member cannot upload to conversation",
    outsider.res.status === 403,
    outsider.data?.message
  );

  socketB.close();

  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length) {
    process.exit(1);
  }
})().catch((error) => {
  console.error("TEST SCRIPT ERROR", error);
  process.exit(1);
});
