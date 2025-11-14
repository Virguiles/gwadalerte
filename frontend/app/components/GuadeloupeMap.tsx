import React from 'react';

export type CommuneData = {
  lib_zone: string;
  lib_qual: string;
  coul_qual: string;
  code_zone?: string;
  code_qual?: number;
  code_no2?: number;
  code_so2?: number;
  code_o3?: number;
  code_pm10?: number;
  code_pm25?: number;
  date_ech?: string;
  date_dif?: string;
  [key: string]: unknown; // Pour les autres propriétés
};

export type AirData = {
  [code_zone: string]: CommuneData;
};

export type HoverInfo = {
  x: number;
  y: number;
  data: CommuneData;
  element?: SVGElement; // Élément SVG survolé pour éviter de le cacher
};

type MapProps = {
  data: AirData;
  onCommuneHover: (info: HoverInfo) => void;
  onCommuneLeave: () => void;
  backgroundColor?: string; // Couleur de fond optionnelle (pour vigilance globale)
  selectedCommune?: string; // Code de la commune sélectionnée
};

const GuadeloupeMap = ({ data, onCommuneHover, onCommuneLeave, backgroundColor, selectedCommune }: MapProps) => {
  const [hoveredCommune, setHoveredCommune] = React.useState<string | null>(null);
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<SVGElement>) => {
    const communeId = e.currentTarget.id;
    if (!communeId) return;

    const code_zone = communeId.split(' ')[0]; // Extrait "97101" de "97101 LES ABYMES"

    // Si une commune est sélectionnée et que ce n'est pas celle-ci, ignorer le survol
    if (selectedCommune && selectedCommune !== code_zone) {
      return;
    }

    // Annuler le délai de masquage s'il existe
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    setHoveredCommune(code_zone);
    const communeData = data[code_zone];

    if (communeData) {
      onCommuneHover({
        x: e.clientX,
        y: e.clientY,
        data: {
          ...communeData,
          code_zone: code_zone, // Ajoute le code_zone aux données
        },
        element: e.currentTarget, // Passer l'élément SVG pour éviter de le cacher
      });
    }
  };

  const handleMouseLeave = () => {
    // Ajouter un petit délai avant de masquer le tooltip pour éviter les disparitions saccadées
    // Cela permet aussi de gérer le cas où le curseur passe rapidement entre les communes
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }

    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredCommune(null);
      onCommuneLeave();
      leaveTimeoutRef.current = null;
    }, 100); // Délai de 100ms pour permettre les transitions fluides
  };

  // Nettoyer le timeout lors du démontage
  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Fonction pour normaliser les couleurs en format hex
  const normalizeColor = (color: string | undefined): string => {
    if (!color) return '#b9b9b9';

    // Si c'est déjà en format hex, retourner tel quel
    if (color.startsWith('#')) {
      return color;
    }

    // Si c'est en format rgb, convertir en hex
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }

    return color;
  };

  const getFillColor = (communeId: string) => {
    const code = communeId.split(' ')[0];

    // Si une commune est sélectionnée et que ce n'est pas celle-ci, retourner gris
    if (selectedCommune && selectedCommune !== code) {
      return '#d1d5db'; // Couleur grise
    }

    const color = data[code]?.coul_qual;
    const normalized = normalizeColor(color);
    // S'assurer que la couleur est toujours en format hex pour éviter les différences d'hydratation
    return normalized;
  }

  // Fonction pour obtenir les styles dynamiques d'une commune
  const getCommuneStyle = (communeId: string) => {
    const code = communeId.split(' ')[0];
    const isHovered = hoveredCommune === code;
    const isSelected = selectedCommune === code;
    const fillColor = getFillColor(communeId);

    return {
      stroke: '#ffffff',
      strokeWidth: isSelected ? 240 : isHovered ? 210 : 200,
      fill: fillColor,
      cursor: 'pointer',
      transition: 'stroke-width 0.15s ease, opacity 0.15s ease',
      opacity: isSelected ? 1 : isHovered ? 0.9 : 0.8,
    };
  }

  return (
    <svg
      viewBox="0 0 86008 74361"
      className="w-full h-auto max-w-full"
      style={{ minHeight: '500px', maxHeight: '100%', backgroundColor: 'white' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <g id="g4">
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97101 LES ABYMES" points="29852,30140 29527,29434 27789,28565 28010,28237 27672,24699 28264,24211 28104,23501 29284,21995 32104,23245 33118,22773 36852,23331 38564,24847 39234,24660 39556,24802 39674,25480 38953,25624 38779,25963 38794,27464 37799,27955 32013,30338 31029,31532 30309,31840 30309,31840 29747,31302 " style={getCommuneStyle('97101 LES ABYMES')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97102 ANSE-BERTRAND" points="42126,8945 40932,9896 40219,9663 40157,8141 39849,7905 39128,7721 38556,6747 38172,6692 37563,7171 36417,7200 35425,7809 34271,7939 30962,6238 29034,6445 30902,4520 31949,4005 32561,3003 34263,2027 36045,0 36425,95 37063,1066 38598,1301 39209,2292 41384,3845 42264,4592 43099,7095 43099,7095 42229,7820 " style={getCommuneStyle('97102 ANSE-BERTRAND')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97103 BAIE-MAHAULT" points="18028,30701 19080,29095 19079,27960 19709,26155 20835,25822 21218,26831 22141,26141 22672,26937 23038,27015 23415,26909 23748,26701 24652,25433 26175,25063 26919,25223 26922,25964 27625,26290 27819,27055 27567,28983 27785,30546 28219,31192 27933,31865 26608,30637 26272,30831 24442,30425 24134,30660 22626,30619 20399,31979 17174,33081 17174,33081 18059,31826 " style={getCommuneStyle('97103 BAIE-MAHAULT')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97104 BAILLIF" points="7686,52210 8497,50490 9491,49339 10799,48561 12280,48204 13449,46766 13824,47311 13526,47569 13311,49112 10736,51971 10072,54188 8579,55426 6829,55551 6829,55551 6324,52896 " style={getCommuneStyle('97104 BAILLIF')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97105 BASSE-TERRE" points="8579,55426 10474,57041 9359,58291 9359,58291 6829,55551 " style={getCommuneStyle('97105 BASSE-TERRE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97106 BOUILLANTE" points="3838,43729 4144,42205 3329,40932 3573,38628 3496,37848 2711,37118 2879,35966 4215,36679 4974,36738 6398,36230 7789,36711 8387,38120 8537,39643 9007,40217 9129,41736 8361,42574 8171,44065 6482,44873 4639,46716 4639,46716 4004,46454 " style={getCommuneStyle('97106 BOUILLANTE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97107 CAPESTERRE-BELLE-EAU" points="19480,55252 19018,54640 18200,53837 16534,52951 16089,51966 15750,51796 15610,50360 14671,49760 14414,48280 13824,47311 13449,46766 14089,46494 15135,46673 15649,46191 17923,46506 20062,47280 22071,46181 23551,45757 24654,44727 25724,44326 26369,44749 26779,46239 26667,49368 27047,50822 25498,53957 21059,57778 20964,58161 20964,58161 20070,57470 " style={getCommuneStyle('97107 CAPESTERRE-BELLE-EAU')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97108 CAPESTERRE-DE-MARIE-GALANTE" points="60087,68176 59442,67343 59822,65501 58534,64706 58871,64507 59467,62281 60556,61865 62734,60246 65369,62519 65812,64035 65648,65603 65027,67057 63672,67845 61658,69703 60251,70415 59079,70586 59079,70586 59324,69474 " style={getCommuneStyle('97108 CAPESTERRE-DE-MARIE-GALANTE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97109 GOURBEYRE" points="9359,58291 10474,57041 13138,55433 13909,55579 15265,54802 15890,53812 15715,52652 16089,51966 16534,52951 16237,54843 15144,56861 15764,58660 15811,59043 15633,59385 14938,59108 13589,59706 13263,59504 12604,59890 10749,59936 10749,59936 10050,58595 " style={getCommuneStyle('97109 GOURBEYRE')} />
        <path onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97110 LA DÉSIRADE" d="m 80634,19840 193,17 367,-442 188,44 1518,-797 944,-663 387,10 330,-469 743,-180 314,483 390,1312 -648,459 -1840,725 -2233,1682 -2703,695 -2331,1066 -287,-117 63,-986 748,-906 1163,-236 433,-656 774,-79 735,-312 752,-650 z m -6910,17865 -931,-248 -198,-318 176,-82 1727,-124 522,236 -162,316 -1134,220 z" style={getCommuneStyle('97110 LA DÉSIRADE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97111 DESHAIES" points="555,25827 681,23877 1221,22848 921,22135 1055,21768 2010,21091 2368,19598 3327,18394 4623,17570 4607,19448 5247,20388 5312,21555 4712,24540 5425,25395 5584,26546 3708,26506 288,27096 288,27096 0,26831 " style={getCommuneStyle('97111 DESHAIES')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97112 GRAND-BOURG" points="56877,71012 54302,70154 52078,68679 51472,67679 50700,63110 50837,62745 52189,61966 52578,62001 53595,63138 55044,63656 56592,63664 57427,64442 58534,64706 59822,65501 59442,67343 60087,68176 59324,69474 59079,70586 59079,70586 58040,71020 " style={getCommuneStyle('97112 GRAND-BOURG')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97113 LE GOSIER" points="38445,34229 36543,34538 32752,33736 31991,32909 30496,32784 30119,32310 30309,31840 31029,31532 32013,30338 37799,27955 40125,29816 41669,33240 41669,33240 39754,33423 " style={getCommuneStyle('97113 LE GOSIER')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97114 GOYAVE" points="23551,45757 22071,46181 20062,47280 17923,46506 15649,46191 15004,45311 16699,42260 18102,41595 19083,40395 21870,38955 24204,38711 24451,39427 25068,39851 25010,40951 26500,42033 25661,43215 25724,44326 25724,44326 24654,44727 " style={getCommuneStyle('97114 GOYAVE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97115 LAMENTIN" points="8356,32907 8955,32438 9184,31326 10689,31654 13159,30548 14586,28694 14432,27549 15257,24945 16371,23934 19067,23584 20178,23952 21664,23670 20855,24979 20189,24898 19646,25444 19709,26155 19079,27960 19080,29095 18028,30701 18059,31826 17174,33081 15336,33720 14943,34393 12615,34298 11082,35470 9541,35474 8839,35771 8839,35771 8249,34396 " style={getCommuneStyle('97115 LAMENTIN')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97116 MORNE-À-L'EAU" points="36852,23331 33118,22773 32104,23245 29284,21995 29317,19740 30056,18860 30711,18500 31853,18593 32540,17775 33624,17400 35152,17581 38163,17031 39818,18984 40484,18595 41378,19853 42901,19898 43456,22113 41677,22850 40623,22396 39238,24268 39234,24660 39234,24660 38564,24847 " style={getCommuneStyle('97116 MORNE-À-L\'EAU')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97117 LE MOULE" points="47979,24471 47754,24152 47967,23417 47352,23137 46050,23998 41191,25560 39674,25480 39556,24802 39234,24660 39238,24268 40623,22396 41677,22850 43456,22113 42901,19898 41378,19853 40484,18595 41109,18147 41114,17379 41614,16799 41516,15663 42089,14713 41916,13244 43014,12930 42998,13722 43561,15198 46205,18634 49989,19650 50762,19485 53101,19859 56684,21310 56326,22789 53727,22610 52381,23241 51943,24221 50514,24750 50514,24750 50309,24414 " style={getCommuneStyle('97117 LE MOULE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97118 PETIT-BOURG" points="13789,43951 11604,43453 10504,43626 9863,41933 9129,41736 9007,40217 8537,39643 8387,38120 7789,36711 8839,35771 9541,35474 11082,35470 12615,34298 14943,34393 15336,33720 17174,33081 20399,31979 22626,30619 24134,30660 23652,32143 24024,33975 23482,34999 23450,35387 23646,36137 24437,36976 24501,37361 24006,37962 24204,38711 21870,38955 19083,40395 18102,41595 16699,42260 15004,45311 15004,45311 14717,44615 " style={getCommuneStyle('97118 PETIT-BOURG')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97119 PETIT-CANAL" points="38163,17031 35152,17581 33624,17400 33095,16966 33327,14796 32095,13454 31881,13151 33663,11083 34425,10934 36347,11384 37090,11159 37917,9378 39352,8754 39471,8002 39849,7905 40157,8141 40219,9663 40932,9896 42126,8945 42229,7820 43099,7095 43743,9687 43014,12930 41916,13244 42089,14713 41516,15663 41614,16799 41114,17379 41109,18147 40484,18595 40484,18595 39818,18984 " style={getCommuneStyle('97119 PETIT-CANAL')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97120 POINTE-À-PITRE" points="29527,29434 29852,30140 29747,31302 30309,31840 30119,32310 30119,32310 27789,28565 " style={getCommuneStyle('97120 POINTE-À-PITRE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97121 POINTE-NOIRE" points="4974,36738 4215,36679 2879,35966 2372,34928 2799,33427 2516,31891 833,29757 288,27096 3708,26506 5584,26546 5506,27685 5817,28380 7513,29237 9184,31326 8955,32438 8356,32907 8249,34396 8839,35771 7789,36711 7789,36711 6398,36230 " style={getCommuneStyle('97121 POINTE-NOIRE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97122 PORT-LOUIS" points="30681,13146 29885,12338 28580,7914 29034,6445 30962,6238 34271,7939 35425,7809 36417,7200 37563,7171 38172,6692 38556,6747 39128,7721 39849,7905 39471,8002 39352,8754 37090,11159 36347,11384 34425,10934 33663,11083 31881,13151 32095,13454 32095,13454 31742,13613 " style={getCommuneStyle('97122 PORT-LOUIS')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97124 SAINT-CLAUDE" points="10072,54188 10736,51971 13311,49112 13526,47569 13824,47311 14414,48280 14671,49760 15610,50360 15750,51796 16089,51966 15715,52652 15890,53812 15265,54802 13909,55579 13138,55433 10474,57041 10474,57041 8579,55426 " style={getCommuneStyle('97124 SAINT-CLAUDE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97125 SAINT-FRANÇOIS" points="60087,25439 60865,26326 64445,27968 66392,28211 67679,29095 65828,28646 59541,28058 55074,29320 52428,29729 51719,29440 51723,28379 50514,24750 51943,24221 52381,23241 53727,22610 56326,22789 56684,21310 56684,21310 58830,22979 " style={getCommuneStyle('97125 SAINT-FRANÇOIS')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97126 SAINT-LOUIS" points="56592,63664 55044,63656 53595,63138 52578,62001 52189,61966 52600,61320 52928,59025 53671,58762 55462,56190 56980,55786 58486,56237 61576,57940 62734,60246 60556,61865 59467,62281 58871,64507 58534,64706 58534,64706 57427,64442 " style={getCommuneStyle('97126 SAINT-LOUIS')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97128 SAINTE-ANNE" points="37799,27955 38794,27464 38779,25963 38953,25624 39674,25480 41191,25560 46050,23998 47352,23137 47967,23417 47754,24152 47979,24471 50309,24414 50514,24750 51723,28379 51719,29440 47315,30578 45820,31774 44681,31846 43316,32406 42786,32961 41669,33240 41669,33240 40125,29816 " style={getCommuneStyle('97128 SAINTE-ANNE')} />
        <path onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97129 SAINTE-ROSE" d="m 21664,23670 -1486,282 -1111,-368 -2696,350 -1114,1011 -825,2604 154,1145 -1427,1854 -2470,1106 -1505,-328 -1671,-2089 -1696,-857 -311,-695 78,-1139 -159,-1151 -713,-855 600,-2985 -65,-1167 -640,-940 16,-1878 1561,-100 924,-652 1785,813 1566,1736 1538,350 3025,1673 2326,45 584,968 1761,864 1166,-187 990,-64 253,225 -438,429 z m 1950,-5236 -384,-78 -424,151 477,-866 555,-51 503,301 10,377 -150,126 -587,40 z" style={getCommuneStyle('97129 SAINTE-ROSE')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97130 TERRE-DE-BAS" points="17677,72107 18196,71828 18843,71140 19797,71418 19952,71535 20079,72092 20930,72516 20791,72836 20268,72885 19548,74060 19035,74361 19035,74361 17299,73427 " style={getCommuneStyle('97130 TERRE-DE-BAS')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97131 TERRE-DE-HAUT" points="22130,72364 22209,72187 22811,71698 24175,71560 24395,71240 24303,70473 24466,70123 24627,70044 24983,70461 25142,70393 25450,69687 25624,69678 25847,69985 25833,70569 26033,70898 25070,71533 24937,72466 23789,72299 23340,72921 23340,72921 22600,72670 " style={getCommuneStyle('97131 TERRE-DE-HAUT')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97132 TROIS-RIVIÈRES" points="13589,59706 14938,59108 15633,59385 15811,59043 15764,58660 15144,56861 16237,54843 16534,52951 18200,53837 19018,54640 19480,55252 20070,57470 20964,58161 20121,59750 19067,60214 17130,60176 16186,60864 15447,60728 14439,61871 14439,61871 13802,61058 " style={getCommuneStyle('97132 TROIS-RIVIÈRES')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97133 VIEUX-FORT" points="11087,62205 10749,59936 12604,59890 13263,59504 13589,59706 13802,61058 14439,61871 14439,61871 12196,62487 " style={getCommuneStyle('97133 VIEUX-FORT')} />
        <polygon onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="commune-path" id="97134 VIEUX-HABITANTS" points="4324,50131 4639,46716 6482,44873 8171,44065 8361,42574 9129,41736 9863,41933 10504,43626 11604,43453 13789,43951 14717,44615 15004,45311 15649,46191 15135,46673 14089,46494 13449,46766 12280,48204 10799,48561 9491,49339 8497,50490 7686,52210 6324,52896 6324,52896 4823,51177 " style={getCommuneStyle('97134 VIEUX-HABITANTS')} />
      </g>
    </svg>
  );
};

export default GuadeloupeMap;
