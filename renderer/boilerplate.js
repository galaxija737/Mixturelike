export async function createBoilerplateProject(boilerplateName, targetPath, name, description, thumbnail) {
  const config = await window.electronAPI.createFromBoilerplate(
    boilerplateName,
    targetPath,
    name,
    description,
    thumbnail
  );
  return config;
}
