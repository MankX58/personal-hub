export type Muscle =
  | "pecho" | "hombro-ant" | "hombro-lat" | "hombro-post" | "triceps" | "biceps" | "antebrazo"
  | "dorsal" | "espalda-alta" | "lumbar" | "abdomen" | "oblicuos"
  | "cuadriceps" | "isquios" | "gluteo" | "aductores" | "gemelos";

export const MUSCLE_LABEL: Record<Muscle, string> = {
  pecho: "Pecho", "hombro-ant": "Deltoide anterior", "hombro-lat": "Deltoide lateral",
  "hombro-post": "Deltoide posterior", triceps: "Tríceps", biceps: "Bíceps", antebrazo: "Antebrazo",
  dorsal: "Dorsal", "espalda-alta": "Espalda alta", lumbar: "Lumbar", abdomen: "Abdomen",
  oblicuos: "Oblicuos", cuadriceps: "Cuádriceps", isquios: "Isquiotibiales", gluteo: "Glúteo",
  aductores: "Aductores", gemelos: "Gemelos",
};

export type Exercise = {
  name: string;
  muscles: Muscle[]; // first = primary
  equipment: string;
  steps: string[];
  tips: string[];
  science?: string;
  bw?: boolean; // bodyweight: kg field = extra load; progress tracked by reps when 0 kg
};

export const EXERCISES: Record<string, Exercise> = {
  // ---------- PECHO ----------
  "press-inclinado-mancuernas": {
    name: "Press inclinado con mancuernas", muscles: ["pecho", "hombro-ant", "triceps"], equipment: "Mancuernas · banco 30°",
    steps: ["Banco a 30°. Escápulas juntas y hacia abajo, pies firmes.", "Baja las mancuernas hasta sentir estiramiento profundo en el pecho, codos a ~45° del torso.", "Empuja hacia arriba y ligeramente hacia dentro sin chocar las mancuernas."],
    tips: ["Controla 2–3 s la bajada.", "No pierdas el arco ni levantes los glúteos."],
    science: "El press inclinado estimula más la porción clavicular del pecho que el plano (Chaves et al., 2024).",
  },
  "press-banca": {
    name: "Press de banca con barra", muscles: ["pecho", "triceps", "hombro-ant"], equipment: "Barra · banco plano",
    steps: ["Ojos bajo la barra, agarre algo más ancho que hombros.", "Retrae escápulas, ligero arco, pies firmes en el suelo.", "Baja la barra a la parte baja del pecho, toca y empuja en línea ligeramente diagonal."],
    tips: ["Antebrazos verticales abajo.", "Usa seguros o un compañero cerca del fallo."],
  },
  "press-maquina": {
    name: "Press de pecho en máquina", muscles: ["pecho", "triceps", "hombro-ant"], equipment: "Máquina convergente",
    steps: ["Ajusta el asiento para que las asas queden a mitad del pecho.", "Escápulas atrás, empuja hasta casi extender codos.", "Vuelve lento hasta un estiramiento completo."],
    tips: ["Ideal para llegar cerca del fallo con seguridad."],
  },
  "press-inclinado-smith": {
    name: "Press inclinado en Smith", muscles: ["pecho", "hombro-ant", "triceps"], equipment: "Máquina Smith · banco 30°",
    steps: ["Coloca el banco para que la barra baje a la parte alta del pecho.", "Desbloquea, baja controlado y empuja."],
    tips: ["Muy estable: buena opción para progresar carga."],
  },
  "aperturas-polea": {
    name: "Aperturas en polea", muscles: ["pecho", "hombro-ant"], equipment: "Poleas a media altura",
    steps: ["Un paso adelante, codos ligeramente flexionados y fijos.", "Abre los brazos hasta sentir un gran estiramiento del pecho.", "Junta las manos delante del esternón apretando el pecho."],
    tips: ["Tensión constante: la polea carga bien la posición estirada."],
  },
  "pec-deck": {
    name: "Contractor de pecho (pec deck)", muscles: ["pecho"], equipment: "Máquina",
    steps: ["Asas a la altura del pecho, espalda pegada al respaldo.", "Cierra los brazos en arco y vuelve lento hasta estirar."],
    tips: ["Mantén los hombros abajo, no encogidos."],
  },
  fondos: {
    name: "Fondos en paralelas", muscles: ["pecho", "triceps", "hombro-ant"], equipment: "Paralelas",
    steps: ["Inclina el torso ligeramente hacia delante.", "Baja hasta que los hombros queden a la altura de los codos o algo más.", "Empuja hasta casi extender."],
    tips: ["Añade lastre cuando hagas +12 repeticiones."],
  },

  // ---------- HOMBRO ----------
  "press-militar-mancuernas": {
    name: "Press militar sentado con mancuernas", muscles: ["hombro-ant", "triceps", "hombro-lat"], equipment: "Mancuernas · banco 80–90°",
    steps: ["Siéntate con la espalda apoyada, mancuernas a la altura de las orejas.", "Empuja hacia arriba sin bloquear del todo.", "Baja hasta que los codos queden ligeramente por debajo de los hombros."],
    tips: ["No arquees la zona lumbar."],
  },
  "press-hombro-maquina": {
    name: "Press de hombro en máquina", muscles: ["hombro-ant", "triceps"], equipment: "Máquina",
    steps: ["Asas a la altura de los hombros.", "Empuja y baja controlado hasta rango completo."],
    tips: ["Más fácil acercarse al fallo con seguridad."],
  },
  "elevaciones-laterales-polea": {
    name: "Elevaciones laterales en polea", muscles: ["hombro-lat"], equipment: "Polea baja",
    steps: ["Polea a la altura de la muñeca, cable por delante o detrás del cuerpo.", "Eleva el brazo hacia fuera hasta la altura del hombro, codo ligeramente flexionado.", "Baja lento, cruzando un poco por delante del cuerpo para estirar."],
    tips: ["Piensa en empujar hacia fuera, no hacia arriba.", "Cada brazo por separado."],
    science: "La polea mantiene tensión en la parte baja del recorrido (posición estirada), asociada a mayor hipertrofia (Wolf et al., 2023).",
  },
  "elevaciones-laterales-mancuerna": {
    name: "Elevaciones laterales con mancuernas", muscles: ["hombro-lat"], equipment: "Mancuernas",
    steps: ["De pie, torso apenas inclinado hacia delante.", "Eleva hasta la altura de los hombros llevando los codos hacia fuera.", "Baja en 2–3 s."],
    tips: ["Sin balanceo; si necesitas impulso, baja peso.", "Las parciales al final de la serie son útiles."],
  },
  "elevaciones-laterales-maquina": {
    name: "Elevaciones laterales en máquina", muscles: ["hombro-lat"], equipment: "Máquina",
    steps: ["Alinea el eje de la máquina con el hombro.", "Eleva con los codos y baja controlado."],
    tips: ["Muy estable para llegar al fallo."],
  },
  "pajaros-maquina": {
    name: "Pájaros en máquina (reverse pec deck)", muscles: ["hombro-post", "espalda-alta"], equipment: "Máquina pec deck",
    steps: ["Siéntate mirando al respaldo, asas a la altura del hombro.", "Abre los brazos hacia atrás en arco sin juntar escápulas en exceso.", "Vuelve lento hasta que las manos casi se toquen."],
    tips: ["Movimiento desde el hombro, no desde la espalda."],
  },
  "face-pull": {
    name: "Face pull", muscles: ["hombro-post", "espalda-alta"], equipment: "Polea alta · cuerda",
    steps: ["Polea a la altura de la cara, agarra la cuerda con pulgares hacia atrás.", "Tira hacia la frente separando las manos y abriendo los codos.", "Vuelve con control."],
    tips: ["Codos altos durante todo el recorrido."],
  },

  // ---------- TRÍCEPS ----------
  "extension-triceps-overhead": {
    name: "Extensión de tríceps sobre la cabeza en polea", muscles: ["triceps"], equipment: "Polea · cuerda o barra",
    steps: ["De espaldas a la polea, brazos por encima de la cabeza con codos apuntando al frente.", "Deja que las manos bajen detrás de la cabeza hasta un estiramiento profundo.", "Extiende los codos sin moverlos de sitio."],
    tips: ["Torso estable, ligeramente inclinado.", "Es el mejor ejercicio de tríceps por evidencia actual."],
    science: "Con los brazos por encima de la cabeza el tríceps crece ~1,4–1,5× más que con extensiones en posición neutra (Maeo et al., 2023).",
  },
  "extension-triceps-mancuerna": {
    name: "Extensión de tríceps con mancuerna sobre la cabeza", muscles: ["triceps"], equipment: "Mancuerna",
    steps: ["Sentado con respaldo, sujeta una mancuerna con ambas manos sobre la cabeza.", "Baja detrás de la cabeza hasta estirar el tríceps.", "Extiende sin abrir codos."],
    tips: ["Baja lento: la parte estirada es la que más cuenta."],
  },
  "press-frances": {
    name: "Press francés (barra EZ)", muscles: ["triceps"], equipment: "Barra EZ · banco",
    steps: ["Tumbado, barra sobre la frente con brazos ligeramente inclinados hacia atrás.", "Flexiona los codos llevando la barra detrás de la cabeza.", "Extiende hasta la posición inicial."],
    tips: ["Inclinar los brazos hacia atrás aumenta el estiramiento de la cabeza larga."],
  },
  "pushdown-polea": {
    name: "Extensión de tríceps en polea alta", muscles: ["triceps"], equipment: "Polea alta · barra o cuerda",
    steps: ["Codos pegados al cuerpo.", "Extiende hasta bloquear y aprieta.", "Sube controlado hasta ~90° de codo o algo más."],
    tips: ["No uses el peso del cuerpo para empujar."],
  },

  // ---------- ESPALDA ----------
  "jalon-pecho": {
    name: "Jalón al pecho", muscles: ["dorsal", "biceps", "espalda-alta"], equipment: "Polea alta",
    steps: ["Agarre algo más ancho que hombros, muslos bien sujetos.", "Tira llevando los codos hacia abajo y atrás hasta la parte alta del pecho.", "Sube del todo dejando que los dorsales se estiren."],
    tips: ["Pecho alto, ligera inclinación atrás.", "El estiramiento arriba es clave."],
  },
  dominadas: {
    name: "Dominadas", muscles: ["dorsal", "biceps", "espalda-alta"], equipment: "Barra fija",
    steps: ["Cuelga con agarre prono algo más ancho que hombros.", "Sube llevando el pecho a la barra con los codos hacia abajo.", "Baja hasta extender los brazos por completo."],
    tips: ["Añade lastre al superar 12 repeticiones limpias."],
  },
  "jalon-neutro": {
    name: "Jalón con agarre neutro", muscles: ["dorsal", "biceps"], equipment: "Polea alta · agarre en V",
    steps: ["Agarre neutro estrecho.", "Tira hacia el esternón llevando codos a las costillas.", "Sube controlado hasta estirar."],
    tips: ["Buena opción si las dominadas molestan en hombros."],
  },
  "remo-pecho-apoyado": {
    name: "Remo con pecho apoyado", muscles: ["espalda-alta", "dorsal", "hombro-post"], equipment: "Banco inclinado o máquina",
    steps: ["Pecho apoyado en el banco a 30–45°.", "Tira de las mancuernas/asas llevando los codos atrás.", "Baja hasta estirar completamente la espalda."],
    tips: ["Elimina el impulso: toda la carga va a la espalda."],
  },
  "remo-barra": {
    name: "Remo con barra", muscles: ["espalda-alta", "dorsal", "lumbar"], equipment: "Barra",
    steps: ["Torso inclinado ~45°, espalda neutra, rodillas ligeramente flexionadas.", "Tira de la barra hacia el ombligo.", "Baja hasta extender los brazos."],
    tips: ["Mantén la columna neutra en todo momento."],
  },
  "remo-polea": {
    name: "Remo sentado en polea", muscles: ["espalda-alta", "dorsal", "biceps"], equipment: "Polea baja",
    steps: ["Siéntate con rodillas ligeramente flexionadas.", "Tira hacia el abdomen llevando codos atrás.", "Deja que los hombros vayan hacia delante al volver para estirar."],
    tips: ["No balancees el torso."],
  },
  "pullover-polea": {
    name: "Pullover en polea", muscles: ["dorsal"], equipment: "Polea alta · cuerda o barra",
    steps: ["De pie, ligeramente inclinado, brazos estirados al frente arriba.", "Lleva la barra/cuerda en arco hasta los muslos con codos casi extendidos.", "Vuelve lento hasta sentir estiramiento del dorsal."],
    tips: ["Aisla el dorsal sin fatigar bíceps."],
  },

  // ---------- BÍCEPS ----------
  "curl-inclinado": {
    name: "Curl inclinado con mancuernas", muscles: ["biceps", "antebrazo"], equipment: "Mancuernas · banco 45–60°",
    steps: ["Recostado, brazos colgando por detrás del torso.", "Flexiona sin adelantar los codos.", "Baja hasta extensión completa."],
    tips: ["La posición estirada del hombro aumenta el estímulo del bíceps."],
    science: "Entrenar en posiciones de mayor longitud muscular tiende a producir más hipertrofia (revisión de Wolf et al., 2023).",
  },
  "curl-bayesian": {
    name: "Curl bayesiano en polea", muscles: ["biceps"], equipment: "Polea baja · agarre",
    steps: ["De espaldas a la polea, brazo detrás del cuerpo.", "Flexiona el codo manteniéndolo detrás del torso.", "Baja lento hasta extender."],
    tips: ["Tensión máxima en el estiramiento."],
  },
  "curl-predicador": {
    name: "Curl en banco predicador", muscles: ["biceps"], equipment: "Barra EZ o máquina",
    steps: ["Axilas apoyadas en el banco.", "Flexiona y baja hasta casi extender por completo."],
    tips: ["No cortes el recorrido abajo: es la parte más efectiva."],
    science: "Las parciales en la parte estirada del curl predicador produjeron hipertrofia similar o mayor que el rango completo (Pedrosa et al., 2022).",
  },
  "curl-martillo": {
    name: "Curl martillo", muscles: ["antebrazo", "biceps"], equipment: "Mancuernas",
    steps: ["Agarre neutro (pulgares arriba).", "Flexiona sin balancear y baja controlado."],
    tips: ["Trabaja braquial y braquiorradial: brazos más gruesos."],
  },
  "curl-barra": {
    name: "Curl con barra EZ", muscles: ["biceps", "antebrazo"], equipment: "Barra EZ",
    steps: ["De pie, codos a los lados.", "Flexiona y baja en 2–3 s."],
    tips: ["Sin impulso de cadera."],
  },

  // ---------- PIERNA ----------
  sentadilla: {
    name: "Sentadilla con barra", muscles: ["cuadriceps", "gluteo", "aductores"], equipment: "Barra · rack",
    steps: ["Barra sobre trapecios, pies a anchura de hombros ligeramente abiertos.", "Inspira, bloquea el core y baja todo lo que permita tu movilidad manteniendo la espalda neutra.", "Sube empujando el suelo."],
    tips: ["Profundidad > peso: bajar hasta abajo da más glúteo y aductores (Kubo et al., 2019)."],
  },
  "hack-squat": {
    name: "Sentadilla hack", muscles: ["cuadriceps", "gluteo"], equipment: "Máquina hack",
    steps: ["Espalda pegada al respaldo, pies a media plataforma.", "Baja profundo con control.", "Empuja sin bloquear rodillas arriba."],
    tips: ["Excelente para cuádriceps cerca del fallo con seguridad."],
  },
  prensa: {
    name: "Prensa de piernas", muscles: ["cuadriceps", "gluteo"], equipment: "Máquina prensa",
    steps: ["Pies a anchura de hombros en mitad de la plataforma.", "Baja hasta que la cadera esté a punto de despegarse.", "Empuja sin bloquear."],
    tips: ["Pies más bajos = más cuádriceps."],
  },
  "sentadilla-bulgara": {
    name: "Sentadilla búlgara", muscles: ["cuadriceps", "gluteo"], equipment: "Mancuernas · banco",
    steps: ["Pie trasero sobre el banco, delantero a un paso largo.", "Baja la rodilla trasera hacia el suelo.", "Empuja con el pie delantero."],
    tips: ["Torso más inclinado = más glúteo."],
  },
  "peso-muerto-rumano": {
    name: "Peso muerto rumano", muscles: ["isquios", "gluteo", "lumbar"], equipment: "Barra o mancuernas",
    steps: ["De pie, rodillas ligeramente flexionadas.", "Lleva la cadera atrás bajando la barra pegada a las piernas hasta sentir estiramiento en isquios.", "Sube empujando la cadera hacia delante."],
    tips: ["Espalda neutra siempre.", "Para cuando la cadera deje de ir hacia atrás."],
  },
  "hip-thrust": {
    name: "Hip thrust", muscles: ["gluteo", "isquios"], equipment: "Barra · banco",
    steps: ["Espalda alta apoyada en el banco, barra sobre la cadera.", "Empuja hasta alinear torso y muslos.", "Aprieta 1 s y baja controlado."],
    tips: ["Mentón hacia el pecho, costillas abajo."],
  },
  "extension-cuadriceps": {
    name: "Extensión de cuádriceps", muscles: ["cuadriceps"], equipment: "Máquina",
    steps: ["Respaldo algo reclinado, rodilla alineada con el eje.", "Extiende hasta arriba y aprieta.", "Baja hasta flexión máxima."],
    tips: ["Reclinar el respaldo estira el recto femoral."],
    science: "Con la cadera más extendida (respaldo reclinado) el recto femoral trabaja más estirado y crece más que sentado erguido (Maeo et al., 2021).",
  },
  "curl-femoral-sentado": {
    name: "Curl femoral sentado", muscles: ["isquios"], equipment: "Máquina",
    steps: ["Ajusta el rodillo sobre los tobillos y el muslo bien sujeto.", "Flexiona las rodillas al máximo.", "Vuelve lento hasta extender."],
    tips: ["Inclínate ligeramente adelante para más estiramiento."],
    science: "El curl femoral sentado produjo más hipertrofia de isquios que el tumbado gracias a la mayor longitud muscular (Maeo et al., 2021).",
  },
  "curl-femoral-tumbado": {
    name: "Curl femoral tumbado", muscles: ["isquios"], equipment: "Máquina",
    steps: ["Tumbado boca abajo, rodilla alineada con el eje.", "Flexiona sin levantar la cadera.", "Baja controlado."],
    tips: ["Complementa al sentado."],
  },
  "gemelos-pie": {
    name: "Elevación de gemelos de pie", muscles: ["gemelos"], equipment: "Máquina o Smith",
    steps: ["Puntas en el borde del escalón, rodillas casi extendidas.", "Baja al máximo y pausa 1–2 s abajo.", "Sube hasta la punta."],
    tips: ["Al fallo, sigue con parciales en la parte baja."],
    science: "Las parciales en posición estirada hipertrofiaron más el gemelo que el rango completo (Kassiano et al., 2023).",
  },
  "gemelos-prensa": {
    name: "Gemelos en prensa", muscles: ["gemelos"], equipment: "Máquina prensa",
    steps: ["Puntas en el borde inferior de la plataforma.", "Baja estirando y empuja con los dedos."],
    tips: ["Pausa en el estiramiento."],
  },
  "gemelos-sentado": {
    name: "Gemelos sentado", muscles: ["gemelos"], equipment: "Máquina",
    steps: ["Rodillas a 90°, almohadilla sobre los muslos.", "Baja al máximo y sube."],
    tips: ["Enfatiza el sóleo."],
  },

  // ---------- CORE ----------
  "crunch-polea": {
    name: "Crunch en polea", muscles: ["abdomen"], equipment: "Polea alta · cuerda",
    steps: ["De rodillas, cuerda junto a la cabeza.", "Flexiona la columna llevando el pecho a la cadera.", "Vuelve estirando el abdomen."],
    tips: ["Mueve la columna, no la cadera.", "Progresa en peso como cualquier músculo."],
  },
  "elevaciones-piernas": {
    name: "Elevaciones de piernas colgado", muscles: ["abdomen", "oblicuos"], equipment: "Barra fija",
    steps: ["Cuelga con hombros activos.", "Eleva las piernas enrollando la pelvis hacia arriba.", "Baja sin balancear."],
    tips: ["Si es muy difícil, flexiona las rodillas."],
  },
  "rueda-abdominal": {
    name: "Rueda abdominal", muscles: ["abdomen", "dorsal"], equipment: "Rueda",
    steps: ["De rodillas, rueda bajo los hombros.", "Avanza manteniendo pelvis en retroversión.", "Vuelve contrayendo el abdomen."],
    tips: ["No dejes que la zona lumbar se hunda."],
  },
  "crunch-maquina": {
    name: "Crunch en máquina", muscles: ["abdomen"], equipment: "Máquina",
    steps: ["Ajusta el asiento y sujeta las asas.", "Flexiona el tronco y vuelve lento."],
    tips: ["Carga progresiva fácil de medir."],
  },
  "crunch-declinado": {
    name: "Crunch declinado", muscles: ["abdomen"], equipment: "Banco declinado",
    steps: ["Pies sujetos, brazos cruzados o disco en el pecho.", "Enrolla el tronco hacia arriba.", "Baja hasta estirar."],
    tips: ["Añade carga cuando hagas +15."],
  },

  // =================== CASA (mancuernas ligeras + peso corporal) ===================
  flexiones: {
    name: "Flexiones", muscles: ["pecho", "triceps", "hombro-ant"], equipment: "Peso corporal", bw: true,
    steps: ["Manos algo más anchas que los hombros, cuerpo en línea de cabeza a talones.", "Baja en 2–3 s hasta casi tocar el suelo con el pecho, codos a ~45°.", "Empuja hasta extender sin perder la línea del cuerpo."],
    tips: ["Si haces +25, pasa a flexiones con déficit o lastre (mochila con peso).", "Pausa 1 s abajo para hacerlas más duras."],
    science: "Las flexiones llevadas cerca del fallo producen una hipertrofia de pecho y tríceps similar al press de banca (Kikuchi y Nakazato, 2017; Kotarsky et al., 2018).",
  },
  "flexiones-deficit": {
    name: "Flexiones con déficit", muscles: ["pecho", "triceps", "hombro-ant"], equipment: "Mancuernas o libros como agarres", bw: true,
    steps: ["Apoya las manos sobre las mancuernas (o libros) para poder bajar más allá de tus manos.", "Baja lento hasta sentir un estiramiento profundo del pecho.", "Empuja hasta arriba manteniendo el core firme."],
    tips: ["Más rango = más estímulo en la posición estirada.", "Usa mancuernas que no rueden."],
    science: "Aumentar el rango hacia la posición estirada tiende a mejorar la hipertrofia (Wolf et al., 2023).",
  },
  "flexiones-declinadas": {
    name: "Flexiones declinadas", muscles: ["pecho", "hombro-ant", "triceps"], equipment: "Silla o sofá", bw: true,
    steps: ["Pies sobre una silla o el sofá, manos en el suelo.", "Baja la cabeza y el pecho hacia el suelo controlando.", "Empuja hasta extender."],
    tips: ["Enfatiza la parte alta del pecho, como un press inclinado.", "Cuanto más alto los pies, más hombro."],
  },
  "press-suelo": {
    name: "Press de suelo con mancuernas", muscles: ["pecho", "triceps"], equipment: "2 mancuernas",
    steps: ["Tumbado en el suelo, rodillas flexionadas, mancuernas sobre el pecho.", "Baja hasta que los tríceps toquen el suelo suavemente.", "Empuja y junta ligeramente las mancuernas arriba."],
    tips: ["Con poco peso: series largas (20–30) y bajada de 3–4 s.", "Úsalo como finalizador tras las flexiones."],
  },
  "flexiones-pica": {
    name: "Flexiones en pica", muscles: ["hombro-ant", "triceps", "hombro-lat"], equipment: "Peso corporal", bw: true,
    steps: ["Cadera alta formando una V invertida, manos a anchura de hombros.", "Baja la cabeza hacia el suelo entre las manos.", "Empuja hasta extender los brazos."],
    tips: ["Pies sobre una silla = más difícil, más parecido al press militar."],
  },
  "elevacion-lateral-inclinada": {
    name: "Elevación lateral inclinada", muscles: ["hombro-lat"], equipment: "1 mancuerna · marco de puerta",
    steps: ["Sujétate al marco de una puerta e inclina el cuerpo hacia fuera.", "Con el brazo libre, eleva la mancuerna hacia fuera hasta la altura del hombro.", "Baja lento cruzando un poco por delante del cuerpo."],
    tips: ["La inclinación carga más la parte baja (estirada) del movimiento: ideal con mancuernas ligeras."],
    science: "Las cargas ligeras llevadas cerca del fallo generan una hipertrofia similar a las pesadas (Schoenfeld et al., 2017; Grgic, 2020).",
  },
  "flexiones-diamante": {
    name: "Flexiones diamante", muscles: ["triceps", "pecho"], equipment: "Peso corporal", bw: true,
    steps: ["Manos juntas bajo el pecho formando un rombo con índices y pulgares.", "Baja manteniendo los codos pegados al cuerpo.", "Extiende completamente."],
    tips: ["Si cuesta mucho, apoya las rodillas."],
  },
  "fondos-silla": {
    name: "Fondos en silla", muscles: ["triceps", "pecho", "hombro-ant"], equipment: "Silla estable o sofá", bw: true,
    steps: ["Manos en el borde de la silla, piernas estiradas al frente.", "Baja flexionando los codos hasta ~90°.", "Empuja hasta extender."],
    tips: ["Mancuerna sobre los muslos para añadir carga.", "Si molesta el hombro, no bajes tanto."],
  },
  "patada-triceps": {
    name: "Patada de tríceps", muscles: ["triceps"], equipment: "1 mancuerna",
    steps: ["Inclinado con apoyo, brazo pegado al torso y codo a 90°.", "Extiende el codo hasta bloquear y aprieta 1 s.", "Vuelve lento."],
    tips: ["Codo fijo: si se mueve, es otro ejercicio."],
  },
  "remo-mesa": {
    name: "Remo invertido bajo mesa", muscles: ["dorsal", "espalda-alta", "biceps"], equipment: "Mesa resistente", bw: true,
    steps: ["Túmbate bajo una mesa robusta y agarra el borde con las manos.", "Con el cuerpo recto, tira del pecho hacia el borde.", "Baja hasta extender los brazos por completo."],
    tips: ["Comprueba antes que la mesa aguanta tu peso.", "Rodillas flexionadas = más fácil; pies elevados = más difícil."],
    science: "Es el tirón con más carga posible en casa sin barra: tu propio peso supera con creces a unas mancuernas ligeras.",
  },
  "remo-unilateral": {
    name: "Remo unilateral con mancuerna", muscles: ["dorsal", "espalda-alta", "biceps"], equipment: "1 mancuerna · silla o sofá",
    steps: ["Mano y rodilla apoyadas en la silla/sofá, espalda neutra.", "Tira de la mancuerna hacia la cadera llevando el codo atrás.", "Baja hasta estirar el dorsal al máximo."],
    tips: ["Con 7,5 kg: 20–30 reps, pausa 1 s arriba y bajada de 3 s.", "Termina con parciales en la parte baja."],
  },
  "pullover-mancuerna": {
    name: "Pullover con mancuerna", muscles: ["dorsal", "pecho"], equipment: "1 mancuerna · suelo o sofá",
    steps: ["Tumbado, sujeta una mancuerna con ambas manos sobre el pecho.", "Llévala en arco por detrás de la cabeza con los codos casi rectos.", "Vuelve tirando con los dorsales."],
    tips: ["Mejor con la espalda alta apoyada en el sofá para más rango."],
  },
  "pajaros-mancuernas": {
    name: "Pájaros con mancuernas", muscles: ["hombro-post", "espalda-alta"], equipment: "2 mancuernas",
    steps: ["Inclinado hacia delante con la espalda neutra.", "Abre los brazos hacia los lados con los codos ligeramente flexionados.", "Baja lento."],
    tips: ["El peso ligero es perfecto: el deltoide posterior es pequeño."],
  },
  "elevaciones-y": {
    name: "Elevaciones en Y tumbado", muscles: ["espalda-alta", "hombro-post"], equipment: "Suelo · mancuernas opcionales", bw: true,
    steps: ["Boca abajo, brazos estirados delante formando una Y.", "Eleva los brazos del suelo juntando escápulas.", "Mantén 1–2 s y baja."],
    tips: ["Añade las mancuernas cuando hagas +20."],
  },
  "curl-supino": {
    name: "Curl con mancuernas", muscles: ["biceps", "antebrazo"], equipment: "2 mancuernas",
    steps: ["De pie, palmas al frente.", "Flexiona sin mover los codos.", "Baja en 3 s hasta extender del todo."],
    tips: ["Series de 15–30 cerca del fallo compensan el poco peso."],
  },
  "curl-concentrado": {
    name: "Curl concentrado", muscles: ["biceps"], equipment: "1 mancuerna · silla",
    steps: ["Sentado, codo apoyado en la cara interna del muslo.", "Flexiona y aprieta arriba 1 s.", "Baja lento hasta extensión completa."],
    tips: ["Sin impulso: el aislamiento compensa la falta de peso."],
  },
  "sentadilla-goblet": {
    name: "Sentadilla goblet con pausa", muscles: ["cuadriceps", "gluteo", "aductores"], equipment: "1 mancuerna",
    steps: ["Sujeta una mancuerna vertical contra el pecho.", "Baja lo más profundo posible y pausa 2 s abajo.", "Sube sin rebotar."],
    tips: ["Bajada de 3 s + pausa = mucho estímulo con poco peso.", "Talones elevados sobre un libro para más cuádriceps."],
  },
  "zancada-deficit": {
    name: "Zancada inversa con déficit", muscles: ["gluteo", "cuadriceps"], equipment: "2 mancuernas · escalón o libro",
    steps: ["De pie sobre un escalón bajo, mancuernas a los lados.", "Da un paso atrás y baja la rodilla trasera por debajo del escalón.", "Vuelve empujando con la pierna delantera."],
    tips: ["El déficit añade rango: más estiramiento de glúteo."],
  },
  "peso-muerto-una-pierna": {
    name: "Peso muerto rumano a una pierna", muscles: ["isquios", "gluteo"], equipment: "2 mancuernas",
    steps: ["De pie sobre una pierna, rodilla ligeramente flexionada.", "Lleva la cadera atrás bajando las mancuernas mientras la otra pierna sube atrás.", "Sube apretando el glúteo."],
    tips: ["A una pierna duplicas la carga relativa de tus mancuernas.", "Apóyate en la pared si pierdes el equilibrio."],
  },
  "sissy-squat": {
    name: "Sissy squat", muscles: ["cuadriceps"], equipment: "Peso corporal · apoyo", bw: true,
    steps: ["Sujétate a una puerta o pared, ponte de puntillas.", "Lleva las rodillas hacia delante y el torso atrás en línea rodillas-hombros.", "Baja hasta donde controles y vuelve."],
    tips: ["Empieza con poco rango: es muy intenso.", "Estira el recto femoral como pocos ejercicios."],
  },
  "curl-nordico": {
    name: "Curl nórdico", muscles: ["isquios"], equipment: "Sofá o alguien que sujete los pies", bw: true,
    steps: ["De rodillas sobre algo blando, talones bien sujetos bajo el sofá.", "Baja el torso hacia delante lo más lento posible con el cuerpo recto.", "Frena con las manos al final y vuelve ayudándote."],
    tips: ["Al principio solo la bajada ya es suficiente.", "Muy exigente: pocas reps de calidad."],
    science: "En un ensayo de 12 semanas el curl nórdico aumentó un 11 % el volumen de los isquiotibiales (Med Sci Sports Exerc, 2024).",
  },
  "curl-femoral-toalla": {
    name: "Curl femoral deslizante", muscles: ["isquios", "gluteo"], equipment: "Toalla · suelo liso",
    steps: ["Boca arriba, talones sobre una toalla, cadera elevada.", "Desliza los talones hacia el glúteo manteniendo la cadera arriba.", "Estira las piernas lentamente."],
    tips: ["Hazlo a una pierna cuando sea fácil."],
  },
  "hip-thrust-una-pierna": {
    name: "Hip thrust a una pierna", muscles: ["gluteo", "isquios"], equipment: "Sofá · mancuerna opcional",
    steps: ["Espalda alta apoyada en el sofá, un pie en el suelo.", "Empuja con el talón hasta alinear torso y muslo.", "Aprieta 2 s arriba y baja."],
    tips: ["Mancuerna sobre la cadera cuando superes 20 reps."],
  },
  "gemelos-una-pierna": {
    name: "Gemelos a una pierna en escalón", muscles: ["gemelos"], equipment: "Escalón · 1 mancuerna",
    steps: ["Punta de un pie en el borde de un escalón, mancuerna en la mano del mismo lado.", "Baja al máximo y pausa 2 s.", "Sube hasta la punta."],
    tips: ["Al fallo, sigue con parciales abajo."],
    science: "Las parciales en posición estirada maximizan la hipertrofia del gemelo (Kassiano et al., 2023).",
  },
  "crunch-mancuerna": {
    name: "Crunch con mancuerna", muscles: ["abdomen"], equipment: "1 mancuerna · suelo",
    steps: ["Tumbado, rodillas flexionadas, mancuerna sobre el pecho.", "Enrolla la columna despegando los hombros del suelo.", "Baja lento."],
    tips: ["Exhala al subir; no tires del cuello."],
  },
  "crunch-inverso": {
    name: "Crunch inverso", muscles: ["abdomen", "oblicuos"], equipment: "Suelo", bw: true,
    steps: ["Tumbado, piernas flexionadas a 90°.", "Enrolla la pelvis llevando las rodillas al pecho y despegando la cadera.", "Baja controlado."],
    tips: ["El movimiento sale de la pelvis, no de las piernas."],
  },
  "elevaciones-piernas-suelo": {
    name: "Elevaciones de piernas tumbado", muscles: ["abdomen"], equipment: "Suelo", bw: true,
    steps: ["Tumbado, manos bajo los glúteos, piernas estiradas.", "Eleva las piernas hasta la vertical.", "Baja sin despegar la zona lumbar del suelo."],
    tips: ["Flexiona las rodillas si notas la lumbar."],
  },
};

/** Exercise created by the user (muscles optional) */
export type CustomEx = { name: string; muscles: Muscle[]; equipment?: string };

export function getEx(id: string, custom: Record<string, CustomEx> = {}): Exercise {
  const c = custom[id];
  if (c) return { name: c.name, muscles: c.muscles, equipment: c.equipment || "Personalizado", steps: [], tips: [] };
  return EXERCISES[id] ?? { name: id, muscles: [], equipment: "", steps: [], tips: [] };
}

/** lowercase, no accents — for search */
export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const youtubeUrl = (ex: Exercise) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " técnica")}`;
