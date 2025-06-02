export async function createBoilerplateProject(boilerplateName, targetPath) {
  const config = await window.electronAPI.createFromBoilerplate(boilerplateName, targetPath);
  return config;
}
