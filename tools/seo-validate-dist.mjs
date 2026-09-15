import fs from "node:fs/promises";
import path from "node:path";

const distDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.cwd(), "dist");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const williamProfilePath = path.join(distDir, "william-almeida", "index.html");
  const requiredFiles = [
    path.join(distDir, "index.html"),
    path.join(distDir, "sitemap.xml"),
    williamProfilePath,
  ];

  const missing = [];
  for (const filePath of requiredFiles) {
    if (!(await exists(filePath))) missing.push(path.relative(distDir, filePath));
  }

  const blogDir = path.join(distDir, "blog");
  const estilosDir = path.join(distDir, "estilos");

  if (!(await exists(blogDir))) missing.push("blog/");
  if (!(await exists(estilosDir))) missing.push("estilos/");

  if (missing.length) {
    console.log("dist validation failed:");
    for (const item of missing) console.log(`- missing: ${item}`);
    process.exit(1);
  }

  const sitemap = await fs.readFile(path.join(distDir, "sitemap.xml"), "utf8");
  const williamHtml = await fs.readFile(williamProfilePath, "utf8");
  const routeCount = [...sitemap.matchAll(/<loc>/g)].length;
  const williamFailures = [];

  if (!sitemap.includes("https://wgalmeida.com.br/william-almeida")) {
    williamFailures.push("William Almeida route missing from sitemap");
  }
  if (!williamHtml.includes('"@type":"ProfilePage"')) {
    williamFailures.push("ProfilePage schema missing from william-almeida/index.html");
  }
  if (!williamHtml.includes('"@type":"Person"')) {
    williamFailures.push("Person schema missing from william-almeida/index.html");
  }
  if (!williamHtml.includes("https://wgalmeida.com.br/william-almeida#person")) {
    williamFailures.push("canonical William Person @id missing from william-almeida/index.html");
  }
  if (!williamHtml.includes("https://www.linkedin.com/in/wgalmeida/")) {
    williamFailures.push("canonical William LinkedIn sameAs missing from william-almeida/index.html");
  }
  if (williamHtml.includes('"foundingDate": "2010"') || williamHtml.includes("há 15 anos")) {
    williamFailures.push("legacy institutional date/age leaked into william-almeida/index.html");
  }

  if (williamFailures.length) {
    console.log("dist validation failed:");
    for (const item of williamFailures) console.log(`- ${item}`);
    process.exit(1);
  }

  console.log(`dist root: ${distDir}`);
  console.log(`sitemap routes: ${routeCount}`);
  console.log("william entity schema: ok");
  console.log("dist validation: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
