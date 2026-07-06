---
description: Kódkonvenció- és domain-nyelv-audit — elindítja a convention-audit subagentet, HTML-riport a tmp/-be
allowed-tools: Task
---

Indítsd el a **convention-audit** subagentet (Agent tool, `subagent_type: convention-audit`).

Feladata: a dokumentált konvenciókat (`Docs/konvenciok.md`) és a domain-nyelvet
(`docs/ddd/`) összevetni a tényleges kódbázissal, és az eltérésekről önálló
HTML-riportot írni ide: `tmp/convention-audit-report.html`.

$ARGUMENTS

Ha a fenti sorban kapsz szűkítést (pl. egy csomag vagy kategória neve), add át az
agentnek fókuszként; egyébként teljes auditot kérj. Miután az agent végzett,
foglald össze röviden: hány eltérés, melyik a legkritikusabb, és hol a riport.
