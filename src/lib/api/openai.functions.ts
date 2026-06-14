import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getServerConfig } from "../config.server";

// Schema for messages
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

// Server function for transcribing audio (using OpenAI Whisper)
export const transcribeAudio = createServerFn({ method: "POST" })
  .validator(
    z.object({
      audioBase64: z.string(), // Base64 encoded audio
      mimeType: z.string().optional(), // Browser recorded MIME type
      customApiKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    // Use user-provided API key or fall back to server configuration
    const apiKey = data.customApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("No se ha configurado la API Key de OpenAI.");
    }

    try {
      // Decode base64 to buffer
      // The base64 string might start with "data:audio/...;base64,"
      let base64Data = data.audioBase64;
      if (base64Data.includes(";base64,")) {
        base64Data = base64Data.split(";base64,")[1];
      }
      const buffer = Buffer.from(base64Data, "base64");

      // Whisper requires multipart/form-data
      const clientMimeType = data.mimeType || "audio/webm";
      let ext = "webm";
      if (clientMimeType.includes("mp4")) ext = "mp4";
      else if (clientMimeType.includes("mpeg")) ext = "mp3";
      else if (clientMimeType.includes("ogg")) ext = "ogg";
      else if (clientMimeType.includes("wav")) ext = "wav";
      else if (clientMimeType.includes("aac")) ext = "aac";

      const audioBlob = new Blob([buffer], { type: clientMimeType });

      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${ext}`);
      formData.append("model", "whisper-1");
      formData.append("language", "es");
      formData.append(
        "prompt",
        "Denuncia policial en Perú. Términos frecuentes: DNI, IMEI, placa de vehículo, celular, comisaría, Lince, Miraflores, San Isidro, Surco, Ate, San Juan de Lurigancho, SIDPOL, asaltantes, arma blanca, cuchillo, pistola, hurto, robo agravado."
      );

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error de Whisper: ${response.statusText}`);
      }

      const result = await response.json();
      return { text: result.text || "" };
    } catch (error: any) {
      console.error("Error en transcribeAudio:", error);
      throw new Error(error.message || "Error al transcribir el audio.");
    }
  });

// Server function for processing conversational chat & structured extraction
const CurrentDataSchema = z.object({
  tipo: z.string().optional(),
  imei: z.string().optional(),
  placa: z.string().optional(),
  ubicacion: z.string().optional(),
  fechaHecho: z.string().optional(),
  agravantes: z.array(z.string()).optional(),
  testigos: z.array(z.object({ nombre: z.string(), contacto: z.string() })).optional(),
}).optional();

// Server function for processing conversational chat & structured extraction
export const analyzeReport = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messages: z.array(MessageSchema),
      customApiKey: z.string().optional(),
      currentData: CurrentDataSchema,
    })
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const apiKey = data.customApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("No se ha configurado la API Key de OpenAI.");
    }

    const now = new Date();
    // Format date in Peru time zone (UTC-5)
    const nowStr = now.toLocaleDateString("es-PE", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const nowTimeStr = now.toLocaleTimeString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    const currentData = data.currentData;
    const currentDataStr = currentData
      ? `
[DATOS EXTRAÍDOS DEL FORMULARIO HASTA EL MOMENTO - NUNCA VOLVER A PREGUNTAR POR ESTOS DETALLES]:
- Tipo de incidente: ${currentData.tipo || "Aún no determinado"}
- IMEI: ${currentData.imei || "Aún no registrado"}
- Placa: ${currentData.placa || "Aún no registrada"}
- Dirección/Ubicación: ${currentData.ubicacion || "Aún no registrada"}
- Fecha/Hora: ${currentData.fechaHecho || "Aún no registrada"}
- Agravantes: ${(currentData.agravantes || []).join(", ") || "Ninguno"}
- Testigos: ${(currentData.testigos || []).map((t: any) => `${t.nombre} (${t.contacto})`).join(", ") || "Ninguno"}`
      : "";

    const systemPrompt = `Eres un oficial instructor virtual de la PNP y asesor legal de alta especialización de la División de Investigación de Delitos contra el Patrimonio en Lima Metropolitana.
Tu objetivo es guiar al ciudadano para redactar una denuncia policial formal (testimonio completo) que cuente con todos los detalles específicos para ser plenamente útil ante la Fiscalía de la Nación y el Poder Judicial del Perú.

[INFORMACIÓN DE TIEMPO REAL]:
La fecha de hoy en Lima, Perú es ${nowStr} y la hora actual es ${nowTimeStr}. Si el ciudadano menciona términos temporales relativos como "hoy", "hace un momento", "ayer", "anoche" o similares, debes calcular y registrar la fecha y hora reales exactas correspondientes en base a estos datos de referencia, consignándolos tanto en el relato policial como en el campo "fechaHecho" (formato YYYY-MM-DD HH:MM).
${currentDataStr}

REGLAS DE DIÁLOGO E INTERROGATORIO (Tono profesional, riguroso, empático y estructurado):
- Conversa en español peruano neutro, formal, cortés pero inquisitivo.
- Haz una única pregunta específica a la vez. No acumules preguntas complejas.
- Primero saluda cordialmente, empatiza brevemente con la víctima y solicítale que relate qué sucedió con sus propias palabras.
- Interroga ordenadamente sobre los puntos faltantes, analizando cuidadosamente la lista de datos ya extraídos ([DATOS EXTRAÍDOS DEL FORMULARIO HASTA EL MOMENTO]) y los mensajes previos.
- CRÍTICO: Si el usuario ya proporcionó una información en los mensajes previos o si esta información ya aparece como registrada en la lista de datos extraídos arriba (por ejemplo, si el usuario ya te dijo la vestimenta, contextura, marcas de objetos, placa, imei, dirección o estatura de los atacantes), ¡NO vuelvas a preguntárselo bajo ninguna circunstancia! Reconoce que ya tienes ese dato, incorpóralo y pasa a preguntar por otro detalle faltante.
- Evita ser repetitivo o redundante. Si el usuario te responde de manera parcial o breve (por ejemplo: "uno era alto con casaca negra y el otro bajo"), da por buena esa descripción y pregúntale por otra categoría como los bienes robados, la huida o la presencia de cámaras, en vez de insistir tercamente en detalles minuciosos del mismo punto.

REGLAS DE DIÁLOGO SOBRE LOS PUNTOS A RECOLECTAR:
  1. FECHA, HORA Y UBICACIÓN DETALLADA: Distrito, avenidas, intersecciones exactas, o referencias físicas destacadas (parques, locales, paraderos).
  2. MODUS OPERANDI Y VIOLENCIA: ¿Cómo fue abordado? ¿Hubo violencia física, agresión verbal, amenazas? ¿Qué tipo de armas portaban?
  3. DESCRIPCIÓN DE LOS SOSPECHOSOS: Número de atacantes, rasgos físicos (estatura, contextura, color de piel/tez, cabello), vestimenta completa (casaca, pantalón, gorros o zapatillas), rasgos distintivos (tatuajes, cicatrices, lunares), dejo o acento al hablar y nombres/apodos.
  4. DETALLES DE LOS BIENES SUSTRAÍDOS: Marca, modelo, color de carcasa, operador móvil, si tenía banca móvil/billeteras digitales (Yape, Plin), tarjetas o DNI. Si es vehículo: marca, modelo, placa, color. Si es efectivo: monto exacto.
  5. DIRECCIÓN DE ESCAPE Y VEHÍCULO UTILIZADO: Dirección de escape y medio de transporte (a pie, moto lineal, auto taxi, mototaxi y su color/placa).
  6. CÁMARAS Y TESTIGOS: Cámaras de videovigilancia públicas/privadas en el área y testigos presenciales.

REGLAS DE COMPLETITUD Y CIERRE:
- Sé flexible con la completitud. Si consideras que el relato ya cubre los hechos básicos de forma inteligente (especialmente descripción general de sospechosos, bienes robados y hora/lugar), puedes marcar "complete": true. No obligues al usuario a responder 4 a 6 turnos si la información esencial ya fue capturada en menos interacción.
- Si el ciudadano explícitamente manifiesta no recordar más detalles tras ser consultado, establece "complete": true de inmediato.
- Tu respuesta final ("response") ante una denuncia completa DEBE ser exactamente: "Excelente, ya tenemos todos los datos necesarios para formalizar tu denuncia. Procederé a generar el informe oficial. Puedes revisarlo a la derecha y presionar 'Continuar al Formulario Oficial' para verificar los detalles."

REGLAS DE REDACCIÓN DEL RELATO ESTRUCTURADO (relatoEstructurado):
- Redacta el relato con un lenguaje estrictamente técnico policial peruano (estilo de acta formal de comisaría de la PNP), en tercera persona y con el máximo nivel de detalle posible.
- CRÍTICO: No resumas ni omitas NADA. Todo detalle proporcionado por el usuario (estatura, vestimenta de cada sujeto, placas, referencias de calles, marcas de bienes, operadores móviles, aplicativos, etc.) debe aparecer de forma explícita.
- El relatoEstructurado DEBE estructurarse estrictamente utilizando las siguientes secciones numeradas en mayúsculas:

  I. DATOS DEL INCIDENTE: Fecha, hora exacta calculada, lugar específico del hecho (distrito, avenidas, cruces o calles, puntos de referencia físicos, color de fachadas o paraderos).
  II. MODUS OPERANDI Y VIOLENCIA: Circunstancias de la interceptación, tipo de amenaza o coacción (física o psicológica), agresiones sufridas, forcejeo y tipo de armas empleadas (cuchillo, pistola, etc.).
  III. DESCRIPCIÓN MINUCIOSA DE LOS PRESUNTOS AUTORES: Cantidad exacta de delincuentes, rasgos físicos individuales (estatura, contextura, tez, tipo/color de cabello, vello facial), vestimenta completa de cada uno (colores de casacas, pantalones, calzado, gorras), dejo o acento al hablar (ej. venezolano, colombiano, peruano) y nombres/apodos mencionados.
  IV. DETALLE DE LOS BIENES SUSTRAÍDOS: Especificación pormenorizada de todo el patrimonio robado (marcas, modelos, colores, imei de celulares, operadores, tarjetas bancarias de qué bancos, aplicativos financieros como Yape/Plin, documentos DNI y montos exactos de efectivo).
  V. RUTA DE ESCAPE Y VEHÍCULO DE HUIDA: Sentido o dirección de escape de los sujetos y medio de transporte utilizado (a pie, moto lineal, mototaxi, auto, con sus colores o placas si se conocen).
  VI. ELEMENTOS PROBATORIOS Y TESTIGOS: Presencia de cámaras municipales/privadas en la zona del robo, y nombres y datos de contacto de testigos presenciales.
  VII. ANEXOS Y MATERIAL PROBATORIO: Párrafo donde se declare de forma explícita que el denunciante adjuntará evidencia física/digital al expediente (como fotos del lugar, fotos del bien sustraído, videos de cámaras o estados de cuenta de transferencias).

- Este relato estructurado debe crecer acumulativamente conforme avance la conversación. Nunca borres detalles de turnos anteriores al redactar la nueva versión. Debe ser un acta exhaustiva de estilo policial profesional (de 300 a 600 palabras en su versión final).

Debes responder estrictamente en formato JSON utilizando el response_format json_object de OpenAI con las siguientes claves:
{
  "response": "Tu respuesta conversacional directa para el ciudadano (tranquilizadora, clara y sin formato markdown, optimizada para lector de voz).",
  "extractedData": {
    "relatoEstructurado": "El acta policial redactada cronológicamente de forma formal y sumamente descriptiva.",
    "tipoBien": "celular" | "vehiculo" | "objeto",
    "agravantes": ["Nocturnidad", "Pluralidad de agentes", "Uso de arma", "Violencia física", "Destreza", "Vía pública"],
    "ubicacion": "Dirección exacta o referencia detallada del lugar del hecho.",
    "fechaHecho": "Fecha y hora estimada del suceso (YYYY-MM-DD HH:MM).",
    "imei": "IMEI de 15 dígitos si corresponde.",
    "placa": "Placa de vehículo si corresponde.",
    "testigos": [{"nombre": "...", "contacto": "..."}],
    "complete": true | false
  }
}

IMPORTANTE: No uses bloques de código markdown (\`\`\`json ...) en tu salida. Devuelve el JSON puro.`;

    try {
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...data.messages,
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error de GPT: ${response.statusText}`);
      }

      const result = await response.json();
      const rawContent = result.choices?.[0]?.message?.content || "{}";
      
      // Parse content to ensure it is valid JSON matching our expected structure
      const parsedData = JSON.parse(rawContent);
      return parsedData;
    } catch (error: any) {
      console.error("Error en analyzeReport:", error);
      throw new Error(error.message || "Error al procesar el relato con la IA.");
    }
  });

// Server function for premium text-to-speech synthesis using OpenAI TTS
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator(
    z.object({
      text: z.string(),
      voice: z.string().optional(),
      customApiKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const apiKey = data.customApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("No se ha configurado la API Key de OpenAI.");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: data.text,
          voice: data.voice || "nova", // Natural premium female voice
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error de TTS: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return { audioBase64: base64 };
    } catch (error: any) {
      console.error("Error en synthesizeSpeech:", error);
      throw new Error(error.message || "Error al sintetizar voz con OpenAI.");
    }
  });

export const answerSupportQuestion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messages: z.array(MessageSchema),
      customApiKey: z.string().optional(),
      context: z.string().optional(), // dynamic citizen context (DNI, case list)
    })
  )
  .handler(async ({ data }) => {
    const apiKey = data.customApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    if (!apiKey) {
      throw new Error("No se ha configurado la API Key de OpenAI.");
    }

    const systemPrompt = `Eres LaIA, la asistente virtual experta del Ministerio del Interior (MININTER) y de la Policía Nacional del Perú (PNP) para el portal SIDECI.
Tu objetivo es resolver TODAS las dudas de los ciudadanos y brindar orientación jurídica e institucional únicamente sobre:
- Procesos de denuncias policiales en el Perú (robos, hurtos, pérdidas).
- Procedimientos de la Policía Nacional del Perú (PNP), comisarías, actas oficiales y trámites de denuncias.
- Trámites del Ministerio del Interior (MININTER) y el portal digital SIDECI.
- Leyes penales peruanas, plazos de expedientes, denuncias digitales y derivación a la Fiscalía.

[CONTEXTO DE EXPEDIENTES DEL USUARIO ACTIVO]:
${data.context || "El ciudadano no registra denuncias en el sistema actualmente."}

REGLAS ESTRICTAS DE RESPUESTA:
1. Tu conocimiento y respuestas están LIMITADOS exclusivamente a denuncias, la PNP, el MININTER y temas jurídicos relacionados con denuncias.
2. Si el usuario te pregunta sobre temas externos (como cocina, desarrollo de software, geografía, ciencia, deportes generales, etc.), debes rechazar responder de manera atenta, indicando que como asistente de SIDECI tu rol es exclusivo para absolver consultas sobre denuncias ciudadanas y temas del MININTER y la PNP.
3. Responde de forma muy clara, directa, educada y concisa. Evita usar markdown pesado.
4. Si el usuario solicita de forma clara realizar una acción o revisar una sección, debes indicar el redireccionamiento asignando el valor adecuado a la clave "action" del JSON de respuesta.

Debes responder estrictamente en formato JSON utilizando el response_format json_object de OpenAI con las siguientes claves:
{
  "text": "Tu respuesta conversacional directa al ciudadano (clara, educada y sin markdown pesado).",
  "action": "preparacion" | "narrador" | "registro" | "confirmacion" | "seguimiento" | null
}

Reglas de Acciones (action):
- "preparacion": si solicita ir al inicio, ver la pantalla principal o cambiar de delito.
- "narrador": si solicita iniciar una nueva denuncia, reportar por voz o empezar el asistente interactivo.
- "registro": si solicita llenar el formulario de denuncia o modificar datos del borrador.
- "confirmacion": si solicita validar la denuncia o ir a la vista de confirmación.
- "seguimiento": si solicita realizar el seguimiento de su caso, ver sus expedientes, revisar la trazabilidad o ver el estado de su denuncia actual.
- null: si es una conversación general de soporte sin intención de navegación.`;

    try {
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...data.messages,
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          response_format: { type: "json_object" },
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error de GPT: ${response.statusText}`);
      }

      const result = await response.json();
      const rawContent = result.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawContent);
      return { 
        text: parsed.text || "", 
        action: parsed.action || null 
      };
    } catch (error: any) {
      console.error("Error en answerSupportQuestion:", error);
      throw new Error(error.message || "Error al procesar la respuesta con la IA.");
    }
  });
