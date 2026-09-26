const paletteBlocks = document.querySelectorAll(".block");
const dropzones = document.querySelectorAll(".dropzone");
const summary = document.getElementById("pipeline-summary");
const summarizeButton = document.getElementById("summarize-button");
const resetButton = document.getElementById("reset-button");
const vrCheckButton = document.getElementById("vr-check-button");
const vrStatus = document.getElementById("vr-status");
const vrScene = document.getElementById("vr-scene");
const emptySummaryText =
  "Start by dragging a block into the workflow, or select one and use a stage's Add selected block button.";
let selectedBlock = "";

let draggedBlock = "";
const vrRotation = { rx: -12, ry: 18 };

const applyVrRotation = () => {
  vrScene.style.setProperty("--rx", `${vrRotation.rx}deg`);
  vrScene.style.setProperty("--ry", `${vrRotation.ry}deg`);
};

const setSelectedBlock = (label) => {
  selectedBlock = label;

  paletteBlocks.forEach((block) => {
    const isSelected = (block.dataset.block || "") === label;
    block.setAttribute("aria-pressed", String(isSelected));
  });
};

const getWorkflowZones = () => [...document.querySelectorAll(".lane .dropzone")];

const updateSummary = () => {
  const stages = [...document.querySelectorAll(".lane")].map((lane) => {
    const stage = lane.dataset.stage;
    const blocks = [...lane.querySelectorAll(".workflow-block-label")].map((node) => node.textContent);
    return { stage, blocks };
  });

  const populatedStages = stages.filter(({ blocks }) => blocks.length);

  if (!populatedStages.length) {
    summary.textContent = emptySummaryText;
    return;
  }

  summary.textContent = populatedStages
    .map(({ stage, blocks }) => `${stage}: ${blocks.join(" → ")}`)
    .join(" • ");
};

const moveWorkflowBlock = (block, direction) => {
  const currentZone = block.parentElement;
  const zones = getWorkflowZones();
  const currentIndex = zones.indexOf(currentZone);
  const targetZone = zones[currentIndex + direction];

  if (!targetZone) {
    return;
  }

  targetZone.append(block);
  updateSummary();
};

const createWorkflowBlock = (label) => {
  const block = document.createElement("div");
  block.className = "workflow-block";

  const text = document.createElement("span");
  text.className = "workflow-block-label";
  text.textContent = label;

  const controls = document.createElement("div");
  controls.className = "workflow-block-controls";

  const moveLeftButton = document.createElement("button");
  moveLeftButton.type = "button";
  moveLeftButton.setAttribute("aria-label", `Move ${label} to the previous stage`);
  moveLeftButton.textContent = "←";
  moveLeftButton.addEventListener("click", () => moveWorkflowBlock(block, -1));

  const moveRightButton = document.createElement("button");
  moveRightButton.type = "button";
  moveRightButton.setAttribute("aria-label", `Move ${label} to the next stage`);
  moveRightButton.textContent = "→";
  moveRightButton.addEventListener("click", () => moveWorkflowBlock(block, 1));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${label}`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    block.remove();
    updateSummary();
  });

  controls.append(moveLeftButton, moveRightButton, removeButton);
  block.append(text, controls);
  return block;
};

paletteBlocks.forEach((block) => {
  block.addEventListener("click", () => {
    const label = block.dataset.block || "";
    setSelectedBlock(selectedBlock === label ? "" : label);
  });

  block.addEventListener("dragstart", (event) => {
    draggedBlock = block.dataset.block || "";
    setSelectedBlock(draggedBlock);
    event.dataTransfer?.setData("text/plain", draggedBlock);
    event.dataTransfer.effectAllowed = "copy";
  });
});

const appendBlockToZone = (dropzone, label) => {
  if (!label) {
    summary.textContent = "Select a block first, then add it to a stage.";
    return;
  }

  dropzone.append(createWorkflowBlock(label));
  updateSummary();
};

dropzones.forEach((dropzone) => {
  const lane = dropzone.closest(".lane");
  const laneAction = lane?.querySelector(".lane-action");

  laneAction?.addEventListener("click", () => {
    appendBlockToZone(dropzone, selectedBlock);
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-active");
    event.dataTransfer.dropEffect = "copy";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-active");
  });

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-active");
    const label = event.dataTransfer?.getData("text/plain") || draggedBlock;

    appendBlockToZone(dropzone, label);
  });
});

summarizeButton.addEventListener("click", updateSummary);

resetButton.addEventListener("click", () => {
  document.querySelectorAll(".workflow-block").forEach((block) => block.remove());
  setSelectedBlock("");
  updateSummary();
});

vrCheckButton.addEventListener("click", async () => {
  if (!("xr" in navigator) || typeof navigator.xr?.isSessionSupported !== "function") {
    vrStatus.textContent =
      "This browser does not expose WebXR. The desktop spatial preview remains available as the fallback experience.";
    return;
  }

  try {
    const supported = await navigator.xr.isSessionSupported("immersive-vr");
    vrStatus.textContent = supported
      ? "WebXR immersive VR is available on this device. The reboot can grow into a full headset mode from this entry point."
      : "WebXR is present, but immersive VR is not available right now. You can still use the desktop spatial preview.";
  } catch (error) {
    console.error("WebXR readiness check failed.", error);
    vrStatus.textContent =
      "WebXR readiness could not be determined in this browser. You can still use the desktop spatial preview.";
  }
});

vrScene.addEventListener("pointermove", (event) => {
  const bounds = vrScene.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;

  vrRotation.rx = -12 - y * 18;
  vrRotation.ry = 18 + x * 28;
  applyVrRotation();
});

vrScene.addEventListener("pointerleave", () => {
  vrRotation.rx = -12;
  vrRotation.ry = 18;
  applyVrRotation();
});

vrScene.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      vrRotation.rx -= 6;
      break;
    case "ArrowDown":
      vrRotation.rx += 6;
      break;
    case "ArrowLeft":
      vrRotation.ry -= 6;
      break;
    case "ArrowRight":
      vrRotation.ry += 6;
      break;
    case "Home":
      vrRotation.rx = -12;
      vrRotation.ry = 18;
      break;
    default:
      return;
  }

  event.preventDefault();
  applyVrRotation();
});
