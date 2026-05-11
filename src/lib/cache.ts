import localforage from "localforage";
import { OsintDossier } from "../types";
import { Node1Structure } from "./gemini";

// Initialize local databases
const dossierStore = localforage.createInstance({
  name: "NabashStudio",
  storeName: "dossiers",
  description: "Caches Node 0 OSINT Dossiers"
});

const structureStore = localforage.createInstance({
  name: "NabashStudio",
  storeName: "structures",
  description: "Caches Node 1 Structures"
});

export async function getCachedDossier(topic: string): Promise<OsintDossier | null> {
  try {
    const slug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const dossier: OsintDossier | null = await dossierStore.getItem(slug);
    return dossier;
  } catch (err) {
    console.error("Cache read error:", err);
    return null;
  }
}

export async function saveCachedDossier(topic: string, dossier: OsintDossier): Promise<void> {
  try {
    const slug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    dossier.id = slug;
    await dossierStore.setItem(slug, dossier);
  } catch (err) {
    console.error("Cache save error:", err);
  }
}

export async function getCachedStructure(topic: string): Promise<Node1Structure | null> {
  try {
    const slug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    return await structureStore.getItem(slug);
  } catch (err) {
    return null;
  }
}

export async function saveCachedStructure(topic: string, structure: Node1Structure): Promise<void> {
  try {
    const slug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    await structureStore.setItem(slug, structure);
  } catch (err) {
    console.error("Cache save error:", err);
  }
}
