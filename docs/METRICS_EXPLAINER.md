# 📊 TypeFlow Metrics & Analytics Explainer

A detailed breakdown of all diagnostic and speed metrics computed in TypeFlow.

## Speed Metrics

* **WPM (Words Per Minute)**: Normalized typing speed based on clean characters divided by 5 per minute elapsed.
* **Raw WPM**: Gross keystrokes typed per minute before error deduplication.
* **Burst WPM**: Peak instantaneous speed measured over individual rapid word sequences.

## Accuracy & Precision

* **Accuracy (%)**: Percentage of correct characters against total typed keystrokes.
* **Consistency (%)**: Standard deviation coefficient of variance across 1-second interval timeline windows. Higher consistency reflects even pacing.
* **Stamina Ratio**: Pacing ratio comparing the speed of the second half of a test against the first half (identifying sprint finishes vs fatigue fade).
