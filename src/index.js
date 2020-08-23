const express = require("express");
const cors = require("cors");
const { v4: uuid_v4, validate: isUuid } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const projects = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);

  return next();
}

function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid project ID." });
  }
}

app.use(logRequests);

app.get("/projects", (request, response) => {
  const { title } = request.query;

  const results = title
    ? projects.filter((project) => project.title.includes(title))
    : projects;

  return response.json(results);
});

app.post("/projects", (request, response) => {
  const { title, owner } = request.body;
  const project = { id: uuid_v4(), title, owner };

  projects.push(project);

  return response.json(project);
});

app.put("/projects/:id", validateProjectId, (request, response) => {
  const { id } = request.params;
  const { title, owner } = request.body;

  const project = { id, title, owner };
  const projectIdx = projects.findIndex((proj) => proj.id === id);

  if (projectIdx < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  projects[projectIdx] = project;

  return response.json(project);
});

app.delete("/projects/:id", validateProjectId, (request, response) => {
  const { id } = request.params;
  const projectIdx = projects.findIndex((project) => project.id === id);

  if (projectIdx < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  projects.splice(projectIdx, 1);
  return response.status(204).send();
});

app.listen(3333, () => {
  console.log("📌 Backend started!");
});
