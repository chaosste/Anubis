# Schema Mapping (Anubis -> NeuroPhenom Canonical)

Anubis is voice-dialogue-first and does not run full NP structural analysis in-app.
This pass adds canonical protocol package export for downstream analysis/codification tools.

## Canonical export included

- `protocolVersion`, `exportedAt`, `sourceApp`
- `session` metadata
- canonical `analysis.transcript` mapped from stored transcripts
- empty placeholders for:
  - `takeaways`
  - `modalities`
  - `phasesCount`
  - `codebookSuggestions`
  - `diachronicStructure`
  - `synchronicStructure`
- canonical `coding` container

## Next step

Run exported package through NeuroPhenom/MicroPhenom analyzer pipeline to populate structural fields.
