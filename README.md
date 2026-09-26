# MindWare Studio

MindWare Studio is a browser-based reboot concept for the original
[thomas-young-2013/mindware](https://github.com/thomas-young-2013/mindware)
project. This repository now includes an initial modern front end with:

- a drag-and-drop visual programming workspace for assembling ML flows
- a spatial "VR lab" view that is ready for WebXR-capable browsers
- the original MindWare MIT license while the reboot direction is still being defined

## Local preview

Because the reboot prototype is a static web app, you can preview it locally with
any simple file server. For example:

```bash
cd /home/runner/work/mindwarestudio/mindwarestudio
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173>.

## Current prototype features

### Drag-and-drop pipeline studio

The home page includes a block palette and workflow stages. Drag a block from the
palette into a stage to sketch a pipeline, then use the "Summarize pipeline" action
to review the flow you assembled.

### VR lab

The VR lab provides a spatial view of the same workflow concepts and checks whether
the current browser/device exposes WebXR immersive VR support. On unsupported
platforms, the prototype falls back to a guided desktop view instead of failing.

## License

This reboot currently uses the original MindWare [MIT License](./LICENSE).
