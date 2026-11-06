// Package media kapselt alles rund um Bilder (ARCHITECTURE.md, Abschnitt 7).
//
// Sprint 1 benötigt nur die URLs der Bildvarianten. Hochladen und Skalieren folgen mit dem
// Redaktionssystem in Sprint 3.
package media

import (
	"fmt"
	"strings"
)

// Widths sind die Breiten der Varianten für srcset.
var Widths = []int{480, 960, 1600}

// Ext liefert die Dateiendung der gespeicherten Varianten.
func Ext(mimeType string) string {
	if mimeType == "image/png" {
		return "png"
	}
	return "jpg"
}

// URL liefert die öffentliche URL einer Variante, z. B. /media/3f9c…-960.jpg.
func URL(storageKey, mimeType, variant string) string {
	return fmt.Sprintf("/media/%s-%s.%s", storageKey, variant, Ext(mimeType))
}

// Srcset liefert den Wert für das Attribut srcset.
func Srcset(storageKey, mimeType string) string {
	parts := make([]string, 0, len(Widths))
	for _, w := range Widths {
		parts = append(parts, fmt.Sprintf("%s %dw", URL(storageKey, mimeType, fmt.Sprint(w)), w))
	}
	return strings.Join(parts, ", ")
}
