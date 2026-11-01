# Common danger score experiment, 1 November 2026

This report records its named development checkpoints. Later actor-knowledge and
object-reaction changes are separate; consult [current rules](../rules.md) and
[release validation](2026-11-01-validation.md) for the final implementation and
checks. Preserve the reported artifacts, seeds and denominators when reproducing
these measurements; a current-build rerun is a new measurement.

The reviewed five decisions remain preferable. A fitted common score changed only three of 3,150 endings on each seed set, changed no aggregate wins, true Dreamer survival or quiet nights, and added no demonstrated improvement in reasons. It substantially changed the few active framing weights. This is a negative result, not a failed implementation. The experiment stays outside the shipped game.

The artifact was reviewed-threat.html, SHA-256 1c525a565becf3a16bd085c87780e8795bf00a69086a5a3ad07930daed5d6bc0. Each model played seven observable policies, 150 seasons per policy, on training seeds 7001, 8001, 9001 and fresh seeds 17001, 18001, 19001: 12,600 actual seasons. Complete measurement took 73.69 seconds. Both arms used identical per-season seeds and independent policy RNG.

The grid fit minimizes mean normalized absolute error with equal weight for the five decisions. It considered nonnegative coefficients 0, 0.5, 1, 2, thresholds 0.5, 1, 2 and victim-weight shares 0.125, 0.25, 0.5. Best D is distinct heard guilty dreams + half the distinct public non-dream accusations; threshold 0.5; victim multiplier 1 + 0.5D. It never reads private belief grids or unresolved private words. The original hearing resolution still runs so changes in decisions are separated from changes to discarded dice.

| Set | Model | Wins | True Dreamer alive | Quiet nights | Dreamer targets | Public-accuser targets |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Training | reviewed | 178/3150 | 1636/3150 | 777 | 110 | 23 |
| Training | common | 178/3150 | 1636/3150 | 777 | 110 | 22 |
| Fresh | reviewed | 180/3150 | 1641/3150 | 691 | 82 | 28 |
| Fresh | common | 180/3150 | 1641/3150 | 691 | 80 | 29 |

## The sparse active cases matter

Overall agreement hides how seldom public opposition was active under these heuristic players. Among calls with any nonzero evidence:

| Decision | Training active calls | Changed | Fresh active calls | Changed |
| --- | ---: | ---: | ---: | ---: |
| closingIn | 14 | 92.9% | 11 | 100.0% |
| harm | 57 | 10.5% | 42 | 11.9% |
| watched | 11 | 0.0% | 10 | 0.0% |
| suspects | 23 | 0.0% | 29 | 3.4% |
| weight | 238 | 17.2% | 267 | 13.9% |

The score halves non-dream framing evidence to compromise with the dream-only harm decision. This changes 13/14 active framing calls in training and 11/11 fresh calls. The observed near-equality of endings cannot establish equivalence against a sophisticated opponent who produces more such cases.

Two thousand paired tell seasons at seed 4242 gave the same classification in both arms: 19 supported inside, none supported outside, 12 insufficient (31 original plus pair/clock rows). Sparse results are not a fairness certificate. New 29.0.0 influence channels are measured separately after this frozen artifact.

## Twenty paired ending accounts

Changed training cases appear first, followed by unselected seed-order controls. Empty accounts mean that no death with a reportable cult reason was printed. The changed accounts show different ordinary victims, not clearer causal reasoning. No live gameplay adopts this model.

### 1. Seed 2880455394, human

Reviewed: The cult chose Dr Ilse Brandt on night 1: Yusuf Shamash had never liked her. The cult chose Hamid al-Shergati on night 3: Hamid stood by you.

Common score: The cult chose Dr Ilse Brandt on night 1: Yusuf Shamash had never liked her. The cult chose Père Anselm Duroc on night 4: Zahrun bar Sam had never liked him.

### 2. Seed 1697043194, sleuth

Reviewed: The cult chose Dr Ilse Brandt on night 1: Hamid al-Shergati could not bear her. The cult chose Zahrun bar Sam on night 3: Major Lionel Ashby had never liked him.

Common score: The cult chose Dr Ilse Brandt on night 1: Hamid al-Shergati could not bear her. The cult chose Yusuf Shamash on night 3: Hamid al-Shergati had never liked him.

### 3. Seed 1000573467, quiet

Reviewed: The cult chose Yusuf Shamash on night 1: Père Anselm Duroc had never liked him. The cult chose Zahrun bar Sam on night 2: Père Anselm Duroc could not bear him. The cult chose Hamid al-Shergati on night 4: Hamid had begun to suspect Dr Ilse Brandt.

Common score: The cult chose Yusuf Shamash on night 1: Père Anselm Duroc had never liked him. The cult chose Zahrun bar Sam on night 2: Père Anselm Duroc could not bear him. The cult chose Constance Pell on night 4: Dr Ilse Brandt had never liked her.

### 4. Seed 7001, human

Reviewed: The cult chose Zahrun bar Sam on night 2: Major Lionel Ashby had never liked him. The cult chose Constance Pell on night 3: Major Lionel Ashby had never liked her. The cult chose Hamid al-Shergati on night 4: Dr Ilse Brandt had never liked him.

Common score: The cult chose Zahrun bar Sam on night 2: Major Lionel Ashby had never liked him. The cult chose Constance Pell on night 3: Major Lionel Ashby had never liked her. The cult chose Hamid al-Shergati on night 4: Dr Ilse Brandt had never liked him.

### 5. Seed 2654442762, human

Reviewed: The cult chose Hamid al-Shergati on night 4: Zahrun bar Sam could not bear him.

Common score: The cult chose Hamid al-Shergati on night 4: Zahrun bar Sam could not bear him.

### 6. Seed 1013911227, human

Reviewed: The cult chose Zahrun bar Sam on night 2: Dr Ilse Brandt could not bear him.

Common score: The cult chose Zahrun bar Sam on night 2: Dr Ilse Brandt could not bear him.

### 7. Seed 3668346988, human

Reviewed: The cult chose Yusuf Shamash on night 2: Père Anselm Duroc had never liked him. The cult chose Hamid al-Shergati on night 3: Major Lionel Ashby had never liked him.

Common score: The cult chose Yusuf Shamash on night 2: Père Anselm Duroc had never liked him. The cult chose Hamid al-Shergati on night 3: Major Lionel Ashby had never liked him.

### 8. Seed 2027815453, human

Reviewed: The cult chose Constance Pell on night 1: Père Anselm Duroc could not bear her. The cult chose Zahrun bar Sam on night 4: Zahrun stood by you.

Common score: The cult chose Constance Pell on night 1: Père Anselm Duroc could not bear her. The cult chose Zahrun bar Sam on night 4: Zahrun stood by you.

### 9. Seed 387283918, human

Reviewed: The cult chose Yusuf Shamash on night 1: Hamid al-Shergati had never liked him. The cult chose Constance Pell on night 2: Hamid al-Shergati could not bear her. The cult chose Père Anselm Duroc on night 4: Dr Ilse Brandt had never liked him.

Common score: The cult chose Yusuf Shamash on night 1: Hamid al-Shergati had never liked him. The cult chose Constance Pell on night 2: Hamid al-Shergati could not bear her. The cult chose Père Anselm Duroc on night 4: Dr Ilse Brandt had never liked him.

### 10. Seed 3041719679, human

Reviewed: The cult chose Père Anselm Duroc on night 2: Dr Ilse Brandt had never liked him. The cult chose Hamid al-Shergati on night 3: Major Lionel Ashby had never liked him.

Common score: The cult chose Père Anselm Duroc on night 2: Dr Ilse Brandt had never liked him. The cult chose Hamid al-Shergati on night 3: Major Lionel Ashby had never liked him.

### 11. Seed 1401188144, human

Reviewed: The cult chose Constance Pell on night 1: Dr Ilse Brandt could not bear her.

Common score: The cult chose Constance Pell on night 1: Dr Ilse Brandt could not bear her.

### 12. Seed 4055623905, human

Reviewed: (No victim account.)

Common score: (No victim account.)

### 13. Seed 2415092370, human

Reviewed: The cult chose Dr Ilse Brandt on night 1: Hamid al-Shergati had never liked her. The cult chose Constance Pell on night 4: Hamid al-Shergati had never liked her.

Common score: The cult chose Dr Ilse Brandt on night 1: Hamid al-Shergati had never liked her. The cult chose Constance Pell on night 4: Hamid al-Shergati had never liked her.

### 14. Seed 774560835, human

Reviewed: The cult chose Zahrun bar Sam on night 3: Dr Ilse Brandt could not bear him. The cult chose Père Anselm Duroc on night 4: Dr Ilse Brandt had never liked him.

Common score: The cult chose Zahrun bar Sam on night 3: Dr Ilse Brandt could not bear him. The cult chose Père Anselm Duroc on night 4: Dr Ilse Brandt had never liked him.

### 15. Seed 3428996596, human

Reviewed: The cult chose Hamid al-Shergati on night 1: Constance Pell had never liked him. The cult chose Zahrun bar Sam on night 4: Zahrun had begun to suspect Père Anselm Duroc.

Common score: The cult chose Hamid al-Shergati on night 1: Constance Pell had never liked him. The cult chose Zahrun bar Sam on night 4: Zahrun had begun to suspect Père Anselm Duroc.

### 16. Seed 1788465061, human

Reviewed: (No victim account.)

Common score: (No victim account.)

### 17. Seed 147933526, human

Reviewed: (No victim account.)

Common score: (No victim account.)

### 18. Seed 2802369287, human

Reviewed: The cult chose Yusuf Shamash on night 3: Hamid al-Shergati had never liked him. The cult chose Zahrun bar Sam on night 4: Constance Pell had never liked him.

Common score: The cult chose Yusuf Shamash on night 3: Hamid al-Shergati had never liked him. The cult chose Zahrun bar Sam on night 4: Constance Pell had never liked him.

### 19. Seed 1161837752, human

Reviewed: The cult chose Dr Ilse Brandt on night 1: Constance Pell had never liked her. The cult chose Père Anselm Duroc on night 3: Constance Pell could not bear him.

Common score: The cult chose Dr Ilse Brandt on night 1: Constance Pell had never liked her. The cult chose Père Anselm Duroc on night 3: Constance Pell could not bear him.

### 20. Seed 3816273513, human

Reviewed: The cult chose Constance Pell on night 3: Zahrun bar Sam had never liked her.

Common score: The cult chose Constance Pell on night 3: Zahrun bar Sam had never liked her.

## Reproduction and limits

Run `node sim/threat.js --file=<preserved-reviewed-artifact> --out=study.json`; then `node sim/tells.js 2000 --file=<same-artifact> --seed=4242 --only=nights,dreams,faces,answers,pairs,clock --threat=study.json --check --allow-insufficient`. The latter can omit `--threat` for the reviewed comparison. The report records raw paired outcomes, decision fidelity and artifact hash. The study does not fit a neural network or a persistent learning actor; those approaches were deferred by the owner. Advanced observable heuristics remain in scope and require a separate performance comparison.
