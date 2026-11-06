# FlashProve von Anthropic

*Recherchestand 5. November 2026*

FlashProve ist ein quelloffener Forschungsprototyp für **beweisbare Inferenz**. Damit lässt sich kryptografisch prüfen, ob die vorgelegte Antwort an den geprüften Stellen mit der Ausgabe einer bestimmten Modellversion übereinstimmt. Die Person, die den Beweis prüft, braucht weder die internen Modellgewichte noch die Hardware, auf der das Modell läuft. Anthropic stellte FlashProve am 2. November 2026 vor und veröffentlichte Code und Dokumentation unter der Apache-2.0-Lizenz. Das GitHub-Repository ist als ungewartetes Forschungsprojekt gekennzeichnet. [1, 2, 4]

## Wie funktioniert der Nachweis?

1. **Modell festlegen.** Der Anbieter veröffentlicht vorab eine Art digitalen Fingerabdruck, das *Commitment*. Es bindet ihn an bestimmte Modellgewichte, also an die Zahlen, die das Verhalten des Modells bestimmen. Die Zahlen selbst bleiben verborgen. Die prüfende Person bezieht die erwartete Kennung aus einer vertrauenswürdigen Quelle, die vom geprüften Server unabhängig ist. [2, 3, 4]
2. **Beweis erzeugen.** Der Anbieter berechnet den Nachweis nachträglich anhand der fertigen Anfrage und Antwort. FlashProve nutzt dafür einen sogenannten *Zero-Knowledge-Beweis* (hier einen zkSNARK). Dieser macht die Aussage über die Berechnung überprüfbar, während die Gewichte im Beweis verborgen bleiben. [2, 3]
3. **Beweis prüfen.** Die prüfende Person gleicht den Beweis mit der erwarteten Modellkennung, der Eingabe und den geprüften Teilen der Antwort ab. Dafür reicht ein Hauptprozessor (CPU). Bei einer exakten Prüfung muss jedes abgedeckte Token, also jeder geprüfte Textbaustein, der ersten Wahl des festgelegten Modells an dieser Stelle entsprechen. [2, 3, 5]

## Was bringt das in der Praxis?

- **Modellwechsel erkennen.** Wer über einen Vermittler für ein bestimmtes Modell bezahlt, könnte mit dem Nachweis prüfen, ob die erhaltene Ausgabe zum versprochenen Modell passt. Liefert ein günstigeres Modell eine abweichende Antwort, würde diese eine exakte Prüfung gegen die erwartete Modellversion verfehlen. [1, 2, 6]
- **Sicherheitstests nachvollziehen.** Unabhängige Prüfer könnten für ausgewählte Anfragen kontrollieren, ob Antworten aus dem laufenden Betrieb zu derselben Modellversion passen, die im Sicherheitstest bewertet wurde. Eine exakte Prüfung kann auch Manipulationen an geprüften Textstellen sichtbar machen. [1, 2, 3]

Der Nachweis bezieht sich auf die Berechnung für die vorgelegte Eingabe und die abgedeckten Textstellen. Ob die Antwort sachlich richtig ist oder wann und auf welchem Server die ursprünglich ausgelieferte Antwort entstand, bleibt damit offen. [2, 3, 5]

## Was hat Anthropic gemessen?

Anthropic testete eine 4-Bit-Version von Metas **Llama 4 Maverick** mit rund 400 Milliarden Parametern. Die Gewichte sind in dieser Version platzsparend dargestellt. Das Modell nutzt pro Token nur einen Teil seiner Parameter, ein Aufbau, der als *Mixture of Experts* bekannt ist. [1, 2, 3]

| Messgröße | Ergebnis im Test von Anthropic |
| --- | --- |
| Kontext pro Anfrage | 1.024 Tokens. Im Haupttest wurde pro Anfrage das erste Token nach der Eingabe geprüft. |
| Beweiserzeugung | Rund 223 Sekunden für 24 gebündelte Anfragen auf einer NVIDIA H100. Das entspricht rund 110 **verarbeiteten** Tokens pro Sekunde über das gesamte Bündel. |
| Größe des Beweises | Rund 19 MB pro Anfrage |
| Prüfung auf einer CPU | Rund 17 Sekunden mit 24 Threads oder 21 Sekunden mit einem Thread, jeweils einschließlich der Vorabprüfungen |
| Zusätzlicher Rechenaufwand | Rund 70- bis 95-mal so viel GPU-Zeit wie die reine Verarbeitung der Eingabe mit vLLM im Vergleichstest von Anthropic |

Der Durchsatz von 110 Tokens pro Sekunde zählt auch die Eingabe mit. Anthropic testete zusätzlich die Prüfung aller Antwort-Tokens und kam dabei auf rund 39 tatsächlich geprüfte Tokens pro Sekunde. Die Zahlen stammen aus Anthropics eigenem Versuchsaufbau. [1, 2, 3]

## Grenzen des Prototyps

- **Kurzer Kontext und hoher Aufwand.** Das Limit von 1.024 Tokens schränkt längere Chats ein. Die Beweise entstehen nachträglich und kosten zusätzliche Rechenzeit und Bandbreite. [1, 2, 3]
- **Festgelegte Berechnung.** Die exakte Prüfung gilt für eine Modellversion mit Ganzzahlarithmetik. Sie wählt an jeder Position den Textbaustein mit der höchsten Bewertung (*Greedy Decoding*). Andere Rechenverfahren oder eine zufallsbasierte Textauswahl können auch bei einer legitimen Antwort zu Abweichungen führen. [2, 3, 5]
- **Begrenzte formale Absicherung.** Anthropic hat zentrale Eigenschaften des Protokolls und des Prüfprogramms in Lean, einem Werkzeug für maschinell überprüfbare mathematische Beweise, formal belegt. Für das schnelle C++-Prüfprogramm und den CUDA-Code zur Beweiserzeugung liegt kein entsprechender formaler Nachweis vor. [2, 3, 5]

## Quellen

1. **heise online**, Tomislav Bezmalinović, 4. November 2026. Der Direktabruf war bei der Recherche nicht möglich. Ausgewertet wurde eine indexierte Kopie des Artikels. [Wer spricht da? Anthropic stellt Identitätsnachweis für KI-Modelle vor](https://www.heise.de/news/Wer-spricht-da-Anthropic-stellt-Identitaetsnachweis-fuer-KI-Modelle-vor-11511036.html) · [Indexierte Kopie bei Allnira](https://allnira.online/de-de/news/wer-spricht-da-anthropic-stellt-identitatsnachweis-fur-ki-modelle-vor-6c11a1876a4f366d8764de4a3f44e1a7a6e033602ff16b1d169ad0ab8ef51c46)
2. **Anthropic**, 2. November 2026. Forschungsankündigung mit Motivation, Funktionsweise und Grenzen. [Progress on provable inference for large language models](https://www.anthropic.com/research/provable-inference)
3. **Anthropic**. Technischer Bericht, insbesondere Abschnitt 6 zum Messaufbau, Abschnitt 7 zu den Grenzen und der Anhang zur nachträglichen Beweiserzeugung. [FlashProve: an open-source library for provable inference](https://www.anthropic.com/document/flashprove-technical-report)
4. **Anthropic**. Offizielles Repository mit Quellcode, Lizenz und Projektstatus. [FlashProve auf GitHub](https://github.com/anthropics/FlashProve)
5. **Anthropic**. Projektdokumentation zum Umfang der Beweise und zu den formalen Garantien. [What is proved](https://github.com/anthropics/FlashProve/blob/main/guide/what-is-proved.md)
6. **TechCrunch**, Russell Brandom, 3. November 2026. Journalistische Einordnung möglicher Anwendungen. [Anthropic is working on a system to prove AI models’ identity](https://techcrunch.com/2026/11/03/anthropic-is-working-on-a-system-to-prove-ai-models-identity/)
