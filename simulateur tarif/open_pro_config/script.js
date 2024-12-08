// Chargement et sauvegarde des données dans le localStorage
function loadData() {
  const data = localStorage.getItem('tarifs');
  if (data) {
    return JSON.parse(data);
  } else {
    return {
      adsl: null,
      fibre: null,
      locationBox: null,
      mobiles: [],
      remiseAdslFibre: null,
      remiseJeuneCreateur: null,
      marges: {1:null,2:null,3:null}
    };
  }
}

function saveData() {
  localStorage.setItem('tarifs', JSON.stringify(tarifs));
}

let tarifs = loadData();

// Navigation entre sections
const links = document.querySelectorAll('nav a[data-section]');
const sections = document.querySelectorAll('section');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sec = link.getAttribute('data-section');
    sections.forEach(s => s.classList.add('hidden'));
    document.getElementById(sec).classList.remove('hidden');

    if (sec === 'section-composition') {
      afficherMobilesDisponibles();
      mettreAJourChoixMarge();
    } else if (sec === 'section-base') {
      afficherMobiles(); 
      chargerFormulaires(); 
    }
  });
});

// Mettre à jour les intitulés des marges dans le menu déroulant
function mettreAJourChoixMarge() {
  const selectMarge = document.getElementById('choix-marge');
  // Index 0 : Aucune marge
  // Index 1 : Marge 1
  // Index 2 : Marge 2
  // Index 3 : Marge 3

  // On va réécrire les options avec les montants
  const options = selectMarge.querySelectorAll('option');
  // options[0] = Aucune
  // options[1] = Marge 1
  // options[2] = Marge 2
  // options[3] = Marge 3

  function formatMarge(num) {
    const val = tarifs.marges[num];
    if (val !== null && !isNaN(val)) {
      return `Marge ${num} (${val}€/mois)`;
    } else {
      return `Marge ${num}`;
    }
  }

  options[1].textContent = formatMarge(1);
  options[2].textContent = formatMarge(2);
  options[3].textContent = formatMarge(3);
}

// Charger les données dans les formulaires de base
function chargerFormulaires() {
  // Fixe
  document.getElementById('adsl-prix').value = tarifs.adsl !== null ? tarifs.adsl : '';
  document.getElementById('fibre-prix').value = tarifs.fibre !== null ? tarifs.fibre : '';
  document.getElementById('location-box').value = tarifs.locationBox !== null ? tarifs.locationBox : '';

  // Remises
  document.getElementById('remise-adsl-fibre').value = tarifs.remiseAdslFibre !== null ? tarifs.remiseAdslFibre : '';
  document.getElementById('remise-jeune-createur').value = tarifs.remiseJeuneCreateur !== null ? tarifs.remiseJeuneCreateur : '';

  // Marges
  document.getElementById('marge-1').value = tarifs.marges[1] !== null ? tarifs.marges[1] : '';
  document.getElementById('marge-2').value = tarifs.marges[2] !== null ? tarifs.marges[2] : '';
  document.getElementById('marge-3').value = tarifs.marges[3] !== null ? tarifs.marges[3] : '';
}

// Formulaire Fixe
document.getElementById('form-fixe').addEventListener('submit', (e) => {
  e.preventDefault();
  const adslPrix = parseFloat(document.getElementById('adsl-prix').value);
  const fibrePrix = parseFloat(document.getElementById('fibre-prix').value);
  const locBox = parseFloat(document.getElementById('location-box').value);

  tarifs.adsl = adslPrix;
  tarifs.fibre = fibrePrix;
  tarifs.locationBox = locBox;

  saveData();
  alert('Offre fixe enregistrée.');
});

// Formulaire Mobiles
document.getElementById('form-mobiles').addEventListener('submit', (e) => {
  e.preventDefault();
  const nom = document.getElementById('mobile-nom').value;
  const engagement = parseInt(document.getElementById('mobile-engagement').value,10);
  const prix = parseFloat(document.getElementById('mobile-prix').value);

  // Vérifier si ce mobile (nom + engagement) existe déjà
  let existant = tarifs.mobiles.find(m => m.nom === nom && m.engagement === engagement);
  if (existant) {
    if (existant.prix !== prix) {
      alert("Cette formule existe déjà avec un autre prix. Supprimez-la d'abord pour la modifier.");
      return;
    } else {
      alert("Cette formule existe déjà avec ce prix, aucune modification.");
      return;
    }
  } else {
    // Ajouter le mobile
    tarifs.mobiles.push({nom, engagement, prix});
    saveData();
    afficherMobiles();
    e.target.reset();
  }
});

function afficherMobiles() {
  const div = document.getElementById('liste-mobiles');
  if (tarifs.mobiles.length === 0) {
    div.innerHTML = "<p>Aucune formule mobile enregistrée.</p>";
    return;
  }

  div.innerHTML = "<h4>Mobiles enregistrés :</h4><ul>" +
    tarifs.mobiles.map((m,i) => `<li>${m.nom} - ${m.engagement} mois - ${m.prix.toFixed(2)} €/mois <button data-index="${i}">Supprimer</button></li>`).join('') +
    "</ul>";

  div.querySelectorAll('button[data-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'),10);
      tarifs.mobiles.splice(index,1);
      saveData();
      afficherMobiles();
    });
  });
}

// Formulaire Remises
document.getElementById('form-remises').addEventListener('submit', (e) => {
  e.preventDefault();
  const adslFibre = parseFloat(document.getElementById('remise-adsl-fibre').value);
  const jeuneCreateur = parseFloat(document.getElementById('remise-jeune-createur').value);

  tarifs.remiseAdslFibre = adslFibre;
  tarifs.remiseJeuneCreateur = jeuneCreateur;

  saveData();
  alert('Remises enregistrées.');
});

// Formulaire Marges
document.getElementById('form-marges').addEventListener('submit', (e) => {
  e.preventDefault();
  const m1 = parseFloat(document.getElementById('marge-1').value) || null;
  const m2 = parseFloat(document.getElementById('marge-2').value) || null;
  const m3 = parseFloat(document.getElementById('marge-3').value) || null;

  tarifs.marges[1] = m1;
  tarifs.marges[2] = m2;
  tarifs.marges[3] = m3;

  saveData();
  alert('Marges enregistrées.');
}

// Afficher mobiles disponibles dans la composition (avec quantités)
function afficherMobilesDisponibles() {
  const div = document.getElementById('mobiles-disponibles');
  if (tarifs.mobiles.length === 0) {
    div.innerHTML = "<p>Aucune formule mobile enregistrée. Veuillez d'abord en ajouter dans Paramètres de base.</p>";
    return;
  }

  let content = "<table><tr><th>Formule</th><th>Engagement</th><th>Prix €/mois</th><th>Quantité</th></tr>";
  tarifs.mobiles.forEach((m, index) => {
    content += `
      <tr>
        <td>${m.nom}</td>
        <td>${m.engagement} mois</td>
        <td>${m.prix.toFixed(2)}</td>
        <td><input type="number" min="0" step="1" value="0" class="quantite-mobile" data-index="${index}" style="width:80px;"></td>
      </tr>
    `;
  });
  content += "</table>";
  div.innerHTML = content;
}

document.getElementById('form-composition').addEventListener('submit', (e) => {
  e.preventDefault();
  const fixeChoix = document.getElementById('choix-fixe').value;
  const remiseAdslFibreCheck = document.getElementById('choix-adsl-fibre').checked;
  const remiseJeuneCreateurCheck = document.getElementById('choix-jeune-createur').checked;
  const margeChoix = parseInt(document.getElementById('choix-marge').value,10);

  // Récupérer les quantités de chaque mobile
  const quantites = Array.from(document.querySelectorAll('.quantite-mobile'))
    .map(input => {
      const index = parseInt(input.getAttribute('data-index'),10);
      const q = parseInt(input.value,10);
      return {mobile: tarifs.mobiles[index], quantite: q};
    })
    .filter(item => item.quantite > 0);

  let mobilesChoisis = [];
  quantites.forEach(item => {
    for (let i=0; i<item.quantite; i++) {
      mobilesChoisis.push(item.mobile);
    }
  });

  const result = calculerPrix(fixeChoix, mobilesChoisis, remiseAdslFibreCheck, remiseJeuneCreateurCheck, margeChoix);
  if (!result) return; // En cas d'erreur (0€)

  const configuration = {
    fixe: fixeChoix === 'adsl' ? 'Livebox ADSL' : 'Livebox FIBRE',
    mobiles: quantites.map(item => ({
      nom: item.mobile.nom,
      engagement: item.mobile.engagement,
      prix: item.mobile.prix,
      quantite: item.quantite
    })),
    remiseAdslFibre: remiseAdslFibreCheck,
    remiseJeuneCreateur: remiseJeuneCreateurCheck,
    marge: margeChoix
  };

  afficherResultats(result, configuration);
});

function calculerPrix(fixeChoix, mobilesChoisis, adslFibreUsed, jeuneCreateurUsed, margeUsed) {
  if (tarifs.adsl === null || tarifs.fibre === null || tarifs.locationBox === null) {
    alert("Veuillez renseigner l'offre fixe dans les paramètres de base avant de calculer.");
    return null;
  }

  let prixFixeBase = (fixeChoix === 'adsl') ? tarifs.adsl : tarifs.fibre;
  prixFixeBase += tarifs.locationBox;

  let remiseAdslFibre = (adslFibreUsed && fixeChoix === 'fibre') ? tarifs.remiseAdslFibre : 0;
  let marge = 0;
  if (margeUsed > 0 && !jeuneCreateurUsed) {
    marge = tarifs.marges[margeUsed] || 0;
  }
  let remiseJeuneCreateur = (jeuneCreateurUsed && margeUsed === 0) ? tarifs.remiseJeuneCreateur : 0;
  let remiseMobile10 = (mobilesChoisis.length >= 2) ? 0.10 : 0;

  let dureeMax = 24;
  let prixParMois = [];

  for (let mois = 1; mois <= dureeMax; mois++) {
    let prixMoisFixe = prixFixeBase;
    if (mois <= 12 && remiseAdslFibre > 0) {
      prixMoisFixe -= remiseAdslFibre;
    }

    let prixMoisMobiles = 0;
    mobilesChoisis.forEach((m) => {
      let p = m.prix;
      // Mois offerts
      if (m.engagement === 12) {
        if ((m.nom === 'essentiel' || m.nom === 'équilibre' || m.nom === 'intense') && mois === 1) {
          p = 0;
        }
      } else if (m.engagement === 24) {
        let moisOfferts = 0;
        if (m.nom === 'initiale') moisOfferts = 1;
        else if (m.nom === 'essentiel') moisOfferts = 2;
        else if (m.nom === 'équilibre' || m.nom === 'intense') moisOfferts = 3;

        if (mois <= moisOfferts) p = 0;
      }

      if (mois > m.engagement) {
        p = 0;
      }

      if (remiseMobile10 > 0 && p > 0) {
        p = p * (1 - remiseMobile10);
      }

      prixMoisMobiles += p;
    });

    let prixMoisTotal = prixMoisFixe + prixMoisMobiles;

    if (mois <= 12 && marge > 0) {
      prixMoisTotal -= marge;
    }

    if (mois <= 12 && remiseJeuneCreateur > 0) {
      prixMoisTotal = prixMoisTotal * (1 - (remiseJeuneCreateur / 100));
    }

    if (prixMoisTotal <= 0) {
      alert("Erreur : Le prix total ne peut pas être de 0€ par mois.");
      return null;
    }

    prixParMois.push(prixMoisTotal);
  }

  let total = prixParMois.reduce((acc, val) => acc + val, 0);
  let moyenne = total / prixParMois.length;

  return {prixParMois, total, moyenne};
}

function afficherResultats({prixParMois, total, moyenne}, config) {
  const div = document.getElementById('resultats-contenu');
  
  // Afficher la composition
  let compoHTML = `<h3>Composition de l'offre</h3>`;
  compoHTML += `<p><strong>Offre fixe :</strong> ${config.fixe}</p>`;

  if (config.mobiles.length > 0) {
    compoHTML += `<p><strong>Mobiles choisis :</strong></p><ul>`;
    config.mobiles.forEach(m => {
      compoHTML += `<li>${m.quantite} × ${m.nom} (${m.engagement} mois) - ${m.prix.toFixed(2)}€/mois</li>`;
    });
    compoHTML += `</ul>`;
  } else {
    compoHTML += `<p>Aucun mobile associé.</p>`;
  }

  compoHTML += `<p><strong>Remises :</strong><br/>`;
  compoHTML += `ADSL vers FIBRE : ${config.remiseAdslFibre ? 'Oui' : 'Non'}<br/>`;
  compoHTML += `Jeune créateur : ${config.remiseJeuneCreateur ? 'Oui' : 'Non'}</p>`;

  compoHTML += `<p><strong>Marge de manoeuvre :</strong> `;
  if (config.marge > 0) {
    let valMarge = tarifs.marges[config.marge];
    if (valMarge !== null && !isNaN(valMarge)) {
      compoHTML += `Marge ${config.marge} (${valMarge}€/mois)`;
    } else {
      compoHTML += `Marge ${config.marge}`;
    }
  } else {
    compoHTML += `Aucune`;
  }
  compoHTML += `</p>`;

  // Afficher les résultats financiers
  let affichageMois = prixParMois.map((p, i) => `<li>Mois ${i+1}: ${p.toFixed(2)} €</li>`).join('');
  let resultHTML = `
    <h3>Détail des Prix</h3>
    <ul>${affichageMois}</ul>
    <p><strong>Total :</strong> ${total.toFixed(2)} € sur ${prixParMois.length} mois</p>
    <p><strong>Moyenne mensuelle :</strong> ${moyenne.toFixed(2)} €</p>
  `;

  div.innerHTML = compoHTML + resultHTML;
  
  sections.forEach(s => s.classList.add('hidden'));
  document.getElementById('section-resultats').classList.remove('hidden');
}
