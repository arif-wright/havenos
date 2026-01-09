# QA – Nice-to-haves (Pet story, inbox helper, pipeline)

- [ ] Verify new animal fields save/load: personality traits, energy level, good with, training, medical needs, ideal home, pipeline stage.
- [ ] Use "Generate story" on an animal detail, ensure description populates deterministically and can be edited before saving.
- [ ] Confirm public animal page shows structured highlights and falls back to generated story when no description exists.
- [ ] Create an animal via modal with optional structured fields and ensure pipeline stage defaults sensibly.
- [ ] Drag a pet between columns on the admin board; confirm status updates (hold/adopted) and stage event logs in `animal_stage_events`.
- [ ] Use suggested replies on an inquiry detail: copy body works; "Send now" posts the quick template email and logs in email logs (when Resend is configured).
- [ ] Regression: list view filters/pagination still behave; bulk status/archiving unaffected by new fields.
