# Future experiments and design questions

This is the retained long-term roadmap. Current behavior is described in
[the rules](rules.md), current contracts in [the architecture guide](architecture.md),
and measured evidence in [the research index](research/README.md). Completed task
lists and superseded release plans are removed; they are not another specification.

## Learning and rule distillation

Neural networks, training and learned gameplay are deferred beyond 29.0.0. The
owner selected equal infrastructure support for every actor: player, individual
camp members, the cult acting together, and justified supernatural decisions.
This is not permission to install a training stack or replace production rules.

Implemented foundations are the shared decision registry, typed actor observations,
legal offered choices, validated serialized proposals, current-rule fallback,
separate privileged evaluation records, local shadow/declarative trials, and
accepted-result replay. Thirteen decisions have audited external observation
contracts. Other decisions must pass the same knowledge review before export;
the registry is not a blanket claim of complete epistemic auditing.

The next stages are:

1. Extend contracts across actors and decision families, with a source and timing
   for every observation. Model memory must be isolated per subject. A shared
   training process may see evaluator labels; a playing policy must not.
2. Add suspended-decision/resume support before asynchronous inference. Validate
   responses once, preserve legal actions, and keep policy randomness independent
   from both game and prose streams. Do not use ordinary autosave as an experiment
   journal for unrecorded NPC proposals.
3. Benchmark small local baselines before choosing a training backend. Compare
   simple tables/trees with small models; prototype MLX or Metal-backed PyTorch
   only when measurements justify the dependency. The game remains a standalone
   browser document, with headless Node as the environment.
4. Evaluate across fresh fixed seeds and multiple observation-only opponents.
   The cult's principal objective is successful rite completion. Exposure,
   disruption, cooperation and survival are supporting considerations; body count
   alone is not a reward. Other actors need goals consistent with their role,
   knowledge and relationships, including imperfect beliefs.
5. Distill useful policies into small, inspectable rules with named factors.
   Compare the source policy, distilled rules and hand-authored baseline with
   paired outcomes, uncertainty, fairness checks and exact accepted-result replay.
   Adoption requires discussion and a deliberate versioned gameplay change.

Resource use must remain adaptive on the development Mac. Budget unified memory
across game workers, browsers and GPU allocations; reserve OS/interactive
headroom, bound jobs and output, and stop incomplete work cleanly under pressure.
Do not promise throughput from core counts or earlier container estimates. See
[the measured Mac workflow](research/2026-11-01-macos-workflow.md).

## Design questions retained for later discussion

- **Cult strength:** the requirement to defeat sophisticated players remains a
  design target. Passing tell checks does not establish strategic strength. Use
  stronger observation-only opponents, diverse histories and held-out scenarios.
- **Rare social histories:** wrong-vote recall and dream defence need more natural
  opportunities; conditional counterfactual assays cannot certify their whole-game
  frequency or every pair-specific tell.
- **Nature signs:** they provide uncertain information, but current paired work
  has not established an overall win-rate benefit. Further tuning must distinguish
  interpretation difficulty from sign frequency and final-trial difficulty.
- **Shared influences:** the uniform framework retains domain-specific factors.
  Do not make every relationship affect every decision automatically. Add a shared
  influence only when its information source and causal purpose are explicit;
  first demonstrate preservation, then discuss any changed rule.
- **Art and music:** both viewpoints are selected, with the original character
  staging and third person by default. Full-height activity scenes were rejected.
  The original Bayati remains selected; other optional art/music studies can be
  revisited through the local reproduction tools, without keeping rejected runtime
  implementations in the shipped game.

New experiments should state a question, artifact/schema hashes, sample plan,
resource limits, observable inputs, primary outcomes and stopping criteria before
running. Store compact durable conclusions and commands in research; keep large
raw data, recordings and generated previews under ignored `.local/`.
