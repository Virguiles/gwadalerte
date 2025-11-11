#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de test pour vérifier les améliorations des données météo par commune
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://127.0.0.1:8000"
TEST_COMMUNE = "97101"  # Les Abymes

def print_section(title):
    """Affiche un titre de section"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_weather_endpoint():
    """Test de l'endpoint /api/weather"""
    print_section("TEST 1: Données Météo Enrichies (/api/weather)")

    try:
        response = requests.get(f"{API_BASE_URL}/api/weather", timeout=10)
        response.raise_for_status()
        data = response.json()

        print(f"✅ Statut: {response.status_code}")
        print(f"✅ Nombre de communes: {len(data)}")

        # Vérifier une commune spécifique
        if TEST_COMMUNE in data:
            commune_data = data[TEST_COMMUNE]
            print(f"\n📍 Exemple: {commune_data['lib_zone']} ({TEST_COMMUNE})")
            print("-" * 80)

            # Données de base
            print("\n🌡️  Températures:")
            print(f"   • Actuelle: {commune_data['temperature']}°C")
            print(f"   • Ressentie: {commune_data['feels_like']}°C")
            print(f"   • Min/Max: {commune_data['temp_min']}°C / {commune_data['temp_max']}°C")

            # Nouvelles données
            print("\n🆕 Données Enrichies:")
            if commune_data.get('dew_point') is not None:
                print(f"   • Point de rosée: {commune_data['dew_point']}°C ✓")
            if commune_data.get('sunrise'):
                print(f"   • Lever du soleil: {commune_data['sunrise']} ✓")
            if commune_data.get('sunset'):
                print(f"   • Coucher du soleil: {commune_data['sunset']} ✓")
            if commune_data.get('visibility') is not None:
                print(f"   • Visibilité: {commune_data['visibility']/1000:.1f} km ✓")
            if commune_data.get('wind_gust') is not None and commune_data['wind_gust'] > 0:
                print(f"   • Rafales de vent: {commune_data['wind_gust']} km/h ✓")
            if commune_data.get('rain_1h') and commune_data['rain_1h'] > 0:
                print(f"   • Précipitations (1h): {commune_data['rain_1h']} mm ✓")
            if commune_data.get('uv_index') is not None:
                uv = commune_data['uv_index']
                uv_label = (
                    "faible" if uv <= 2 else
                    "modéré" if uv <= 5 else
                    "élevé" if uv <= 7 else
                    "très élevé" if uv <= 10 else
                    "extrême"
                )
                print(f"   • Indice UV: {uv} ({uv_label}) ✓")

            # Autres données
            print("\n🌤️  Conditions:")
            print(f"   • Météo: {commune_data['weather_description']}")
            print(f"   • Humidité: {commune_data['humidity']}%")
            print(f"   • Vent: {commune_data['wind_speed']} km/h")
            print(f"   • Nuages: {commune_data['clouds']}%")
            print(f"   • Pression: {commune_data['pressure']} hPa")

        # Vérifier Saint-Martin
        if "97801" in data:
            print(f"\n✅ Saint-Martin (97801) est bien inclus: {data['97801']['lib_zone']}")

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_forecast_endpoint():
    """Test de l'endpoint /api/forecast/{code_zone}"""
    print_section("TEST 2: Prévisions Météo 5 Jours (/api/forecast/{code_zone})")

    try:
        response = requests.get(f"{API_BASE_URL}/api/forecast/{TEST_COMMUNE}", timeout=15)
        response.raise_for_status()
        data = response.json()

        print(f"✅ Statut: {response.status_code}")
        print(f"✅ Commune: {data['lib_zone']} ({data['code_zone']})")
        print(f"✅ Nombre de jours: {len(data['daily'])}")

        # Afficher les prévisions par jour
        print("\n📅 Prévisions par jour:")
        print("-" * 80)

        for date, day_data in sorted(data['daily'].items())[:5]:  # Limiter à 5 jours
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            date_fr = date_obj.strftime("%A %d %B %Y")

            print(f"\n📆 {date_fr}")
            print(f"   • Températures: {day_data['temp_min']}°C - {day_data['temp_max']}°C")
            print(f"   • Météo: {day_data['main_weather_description']}")
            print(f"   • Nombre de prévisions horaires: {len(day_data['hourly'])}")

            # Afficher quelques prévisions horaires
            print("   • Prévisions horaires (échantillon):")
            for i, hourly in enumerate(day_data['hourly'][:3]):  # 3 premières heures
                pop = hourly.get('pop', 0)
                rain = hourly.get('rain_3h', 0)
                print(f"      - {hourly['time']}: {hourly['temperature']}°C, "
                      f"{hourly['weather_description']}, "
                      f"prob. pluie: {pop}%"
                      f"{f', pluie: {rain}mm' if rain > 0 else ''}")

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_vigilance_endpoint():
    """Test de l'endpoint /api/vigilance"""
    print_section("TEST 3: Vigilance Météo France (/api/vigilance)")

    try:
        response = requests.get(f"{API_BASE_URL}/api/vigilance", timeout=10)
        response.raise_for_status()
        data = response.json()

        print(f"✅ Statut: {response.status_code}")
        print(f"✅ Département: {data['department_name']} ({data['department']})")
        print(f"✅ Niveau: {data['label']} (niveau {data['level']})")
        print(f"✅ Couleur: {data['color']}")

        if data.get('risks'):
            print(f"\n⚠️  Risques identifiés ({len(data['risks'])}):")
            for risk in data['risks']:
                print(f"   • {risk['type']}: niveau {risk['level']}")
        else:
            print("\n✅ Aucun risque particulier")

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_coordinates_precision():
    """Test de la précision des coordonnées"""
    print_section("TEST 4: Précision des Coordonnées Géographiques")

    try:
        response = requests.get(f"{API_BASE_URL}/api/weather", timeout=10)
        response.raise_for_status()
        data = response.json()

        print("✅ Vérification de la précision des coordonnées (via les noms des communes)")

        # Échantillon de communes avec leurs noms attendus
        expected_communes = {
            "97101": "Les Abymes",
            "97102": "Anse-Bertrand",
            "97116": "Morne-à-l'Eau",
            "97801": "Saint-Martin",
        }

        all_correct = True
        for code, expected_name in expected_communes.items():
            if code in data:
                actual_name = data[code]['lib_zone']
                if actual_name == expected_name:
                    print(f"   ✅ {code}: {actual_name}")
                else:
                    print(f"   ❌ {code}: attendu '{expected_name}', obtenu '{actual_name}'")
                    all_correct = False
            else:
                print(f"   ❌ {code}: commune non trouvée")
                all_correct = False

        if all_correct:
            print("\n✅ Tous les noms de communes sont corrects")

        return all_correct

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*20 + "TEST DES AMÉLIORATIONS MÉTÉO" + " "*30 + "║")
    print("║" + " "*25 + "Guadeloupe - 971" + " "*35 + "║")
    print("╚" + "="*78 + "╝")

    # Vérifier que l'API est accessible
    try:
        response = requests.get(f"{API_BASE_URL}/api/weather", timeout=5)
        response.raise_for_status()
        print("\n✅ API accessible à:", API_BASE_URL)
    except Exception as e:
        print(f"\n❌ Erreur: L'API n'est pas accessible à {API_BASE_URL}")
        print(f"   Détail: {e}")
        print("\n💡 Assurez-vous que le serveur backend est démarré:")
        print("   cd backend && source venv/bin/activate && uvicorn main:app --reload")
        return

    # Exécuter les tests
    results = []
    results.append(("Données météo enrichies", test_weather_endpoint()))
    results.append(("Prévisions 5 jours", test_forecast_endpoint()))
    results.append(("Vigilance Météo France", test_vigilance_endpoint()))
    results.append(("Précision des coordonnées", test_coordinates_precision()))

    # Résumé
    print_section("RÉSUMÉ DES TESTS")

    total = len(results)
    passed = sum(1 for _, result in results if result)

    for test_name, result in results:
        status = "✅ RÉUSSI" if result else "❌ ÉCHOUÉ"
        print(f"{status}: {test_name}")

    print(f"\n{'='*80}")
    print(f"Résultat: {passed}/{total} tests réussis ({passed*100//total}%)")
    print(f"{'='*80}\n")

    if passed == total:
        print("🎉 Toutes les améliorations fonctionnent correctement ! 🎉")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.")

if __name__ == "__main__":
    main()
