import { useId } from "react";

export type DiagramKind = "overview" | "front" | "top" | "flow" | "electric";
const names: Record<DiagramKind, string> = {
  overview: "Konsep nano reef 45 cm",
  front: "Tampak depan: panjang 45 cm, tinggi 30 cm",
  top: "Tampak atas: panjang 45 cm, kedalaman 30 cm",
  flow: "Skema aliran filter gantung HOB",
  electric: "Skema penempatan listrik dan drip loop",
};

export default function Diagram({
  kind = "overview",
  onSelect,
}: {
  kind?: DiagramKind;
  onSelect?: (id: string) => void;
}) {
  const id = useId().replace(/:/g, "");
  const water = `${id}-water`,
    glow = `${id}-glow`,
    arrow = `${id}-arrow`;
  const point = (
    x: number,
    y: number,
    label: string,
    item: string,
    number: number,
  ) => (
    <g
      className={onSelect ? "diagram-hotspot" : ""}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Lihat kebutuhan ${label}` : undefined}
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
    >
      <circle
        cx={x}
        cy={y}
        r="13"
        fill="#102c39"
        stroke="#6ce0c5"
        strokeWidth="1.5"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#b2f9e9"
        fontSize="11"
        fontWeight="700"
      >
        {number}
      </text>
      <text x={x + 21} y={y + 4} fill="#d0e8eb" fontSize="12">
        {label}
      </text>
    </g>
  );
  return (
    <svg
      className={`tank-diagram diagram-${kind}`}
      viewBox="0 0 720 430"
      role={onSelect ? "group" : "img"}
      aria-labelledby={`${id}-title ${id}-desc`}
    >
      <title id={`${id}-title`}>{names[kind]}</title>
      <desc id={`${id}-desc`}>
        Ilustrasi skematis, bukan gambar kerja konstruksi. Ukuran luar atau
        dalam harus dikonfirmasi kepada pembuat tank.
      </desc>
      <defs>
        <linearGradient id={water} x1="0" x2="0.2" y1="0" y2="1">
          <stop stopColor="#3ca4ba" stopOpacity=".24" />
          <stop offset="1" stopColor="#0a576b" stopOpacity=".1" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop stopColor="#49c9ca" stopOpacity=".16" />
          <stop offset="1" stopColor="#49c9ca" stopOpacity="0" />
        </radialGradient>
        <marker
          id={arrow}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto"
        >
          <path d="M0 0L7 3.5L0 7" fill="#69d9c2" />
        </marker>
        <pattern
          id={`${id}-grid`}
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 0H0V28"
            fill="none"
            stroke="#527c89"
            strokeOpacity=".09"
          />
        </pattern>
      </defs>
      <rect width="720" height="430" fill={`url(#${id}-grid)`} />
      <ellipse cx="360" cy="255" rx="310" ry="185" fill={`url(#${glow})`} />
      {kind === "overview" && (
        <>
          <ellipse
            cx="352"
            cy="375"
            rx="230"
            ry="24"
            fill="#020e18"
            opacity=".55"
          />
          <path
            d="M155 149L465 149L565 99L255 99Z"
            fill="#70c9d4"
            fillOpacity=".06"
            stroke="#7fb8c6"
            strokeOpacity=".45"
          />
          <path
            d="M465 149L565 99V307L465 360Z"
            fill="#163c4a"
            fillOpacity=".6"
            stroke="#7fb8c6"
            strokeOpacity=".5"
          />
          <path
            d="M155 149H465V360H155Z"
            fill={`url(#${water})`}
            stroke="#9dced6"
            strokeOpacity=".65"
            strokeWidth="1.5"
          />
          <path
            d="M155 177H465L565 127L255 127Z"
            fill="#58bdcc"
            fillOpacity=".13"
            stroke="#5fb6c3"
            strokeOpacity=".35"
          />
          <path
            d="M155 342H465L565 290V307L465 360H155Z"
            fill="#c4bf9d"
            fillOpacity=".4"
          />
          <path
            d="M220 339L213 312L236 295L232 274L260 254L294 264L308 295L336 301L350 335Z"
            fill="#3a5461"
            stroke="#6e7f81"
            strokeWidth="1.5"
          />
          <path
            d="M346 337L359 300L386 289L400 267L424 276L442 315L453 337Z"
            fill="#314e5c"
            stroke="#6e7f81"
          />
          <path
            d="M247 285L260 270L278 280M361 315L378 305L397 314M281 310L296 300"
            fill="none"
            stroke="#78908e"
            strokeOpacity=".4"
            strokeWidth="3"
          />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <path
                d={`M${253 + i * 5} 272 Q${246 + i * 7} ${245 - (i % 3) * 7} ${250 + i * 6} ${237 + (i % 2) * 8}`}
                stroke={i % 2 ? "#d49e8a" : "#9cb8a5"}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <circle
                cx={383 + i * 5}
                cy={292 - (i % 3) * 4}
                r="6"
                fill={i % 2 ? "#b79e9a" : "#b7b78b"}
                opacity=".85"
              />
            </g>
          ))}
          <g transform="translate(335 222)">
            <path d="M-30 0Q-2-22 20 0Q-2 22-30 0L-42-13V13Z" fill="#eea277" />
            <path
              d="M-19-10L-14 10M2-10L7 9"
              stroke="#f4eee0"
              strokeWidth="5"
            />
            <circle cx="12" cy="-2" r="2" fill="#122a35" />
          </g>
          <path
            d="M265 91L494 91L515 80H286Z"
            fill="#12212e"
            stroke="#52636b"
          />
          <path d="M268 95H493" stroke="#85d5f2" strokeWidth="3" />
          <path
            d="M470 91V53H518V300"
            fill="none"
            stroke="#536a76"
            strokeWidth="6"
          />
          <path
            d="M173 153V116H221V165H200V248"
            fill="none"
            stroke="#6d858e"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <rect
            x="175"
            y="118"
            width="46"
            height="41"
            rx="4"
            fill="#233b47"
            stroke="#728c95"
          />
          <path d="M166 375H455M166 370V380M455 370V380" stroke="#6c98a5" />
          <text
            x="310"
            y="398"
            textAnchor="middle"
            fill="#a6c0c7"
            fontSize="13"
          >
            45 cm
          </text>
          <path d="M130 153V359M125 153H135M125 359H135" stroke="#6c98a5" />
          <text
            x="109"
            y="259"
            transform="rotate(-90 109 259)"
            fill="#a6c0c7"
            fontSize="13"
          >
            30 cm
          </text>
          {point(334, 65, "Lampu reef", "light", 1)}
          {point(109, 123, "HOB", "filter", 2)}
          {point(511, 250, "Aliran", "flow", 3)}
          <text x="22" y="413" fill="#7695a2" fontSize="10" letterSpacing="1.5">
            KONSEP • BUKAN GAMBAR KERJA
          </text>
        </>
      )}
      {(kind === "front" || kind === "flow") && (
        <>
          <rect
            x="150"
            y="100"
            width="420"
            height="245"
            rx="2"
            fill={`url(#${water})`}
            stroke="#95bec8"
            strokeWidth="2"
          />
          <path d="M150 132H570" stroke="#5fd5cc" strokeDasharray="6 5" />
          <text x="584" y="136" fill="#9bc1ca" fontSize="11">
            Muka air*
          </text>
          <path d="M151 329H569V345H151Z" fill="#bdb38e" fillOpacity=".38" />
          <path
            d="M240 328L230 296L247 277L246 254L282 235L312 254L329 305L350 328Z"
            fill="#3a5662"
            stroke="#728c92"
          />
          <path
            d="M399 328L408 294L437 278L465 295L478 328Z"
            fill="#35505c"
            stroke="#728c92"
          />
          <rect
            x="170"
            y="76"
            width="72"
            height="62"
            rx="5"
            fill="#233c49"
            stroke="#7e9ca7"
          />
          <path d="M195 132V249" stroke="#7e9ca7" strokeWidth="9" />
          <path
            d="M228 128V156H259"
            fill="none"
            stroke="#7e9ca7"
            strokeWidth="8"
          />
          <rect x="245" y="58" width="230" height="10" rx="4" fill="#516b79" />
          <path d="M253 74H468" stroke="#84d5e4" strokeWidth="3" />
          {kind === "flow" ? (
            <>
              <path
                d="M194 287V174M267 160Q450 162 510 213Q550 278 476 299M397 306Q349 321 337 285"
                fill="none"
                stroke="#69d9c2"
                strokeWidth="2"
                strokeDasharray="7 5"
                markerEnd={`url(#${arrow})`}
              />
              <text x="289" y="148" fill="#a1ddcf" fontSize="12">
                Return HOB → permukaan
              </text>
              <text x="166" y="306" fill="#a1ddcf" fontSize="11">
                Intake ↑
              </text>
              <text x="375" y="369" fill="#9ab4be" fontSize="12">
                Jaga ruang aliran di sekitar batu
              </text>
            </>
          ) : (
            <>
              <path
                d="M150 375H570M150 368V382M570 368V382M116 100V345M109 100H123M109 345H123"
                stroke="#7aa2ae"
              />
              <text
                x="360"
                y="399"
                textAnchor="middle"
                fill="#bbd4d8"
                fontSize="15"
              >
                45 cm
              </text>
              <text
                x="92"
                y="239"
                transform="rotate(-90 92 239)"
                fill="#bbd4d8"
                fontSize="15"
              >
                30 cm
              </text>
            </>
          )}
          <text x="30" y="421" fill="#839fab" fontSize="11">
            *Tinggi air mengikuti batas kerja filter, bukan otomatis tinggi
            kaca. Skema tidak berskala.
          </text>
        </>
      )}
      {kind === "top" && (
        <>
          <rect
            x="150"
            y="91"
            width="420"
            height="258"
            fill={`url(#${water})`}
            stroke="#95bec8"
            strokeWidth="2"
          />
          <rect
            x="175"
            y="56"
            width="82"
            height="48"
            rx="4"
            fill="#233c49"
            stroke="#7e9ca7"
          />
          <text x="216" y="82" textAnchor="middle" fill="#c1dbdf" fontSize="12">
            HOB
          </text>
          <path
            d="M194 134V295H527V134Z"
            fill="none"
            stroke="#70919a"
            strokeDasharray="5 6"
          />
          <text
            x="371"
            y="320"
            textAnchor="middle"
            fill="#a5bcc2"
            fontSize="12"
          >
            Ruang akses pembersih kaca
          </text>
          <path
            d="M249 254L235 213L260 166L304 151L337 179L352 219L324 267Z"
            fill="#3d5761"
            stroke="#6f8a8d"
          />
          <path
            d="M410 264L394 216L412 193L451 203L478 250L450 277Z"
            fill="#3d5761"
            stroke="#6f8a8d"
          />
          <path
            d="M276 119Q465 113 518 179Q554 251 490 284"
            stroke="#69d9c2"
            strokeWidth="2"
            strokeDasharray="6 5"
            fill="none"
            markerEnd={`url(#${arrow})`}
          />
          <text
            x="366"
            y="235"
            fill="#9bbbc2"
            fontSize="11"
            textAnchor="middle"
          >
            Ruang
          </text>
          <text
            x="366"
            y="251"
            fill="#9bbbc2"
            fontSize="11"
            textAnchor="middle"
          >
            berenang
          </text>
          <path
            d="M150 374H570M150 368V380M570 368V380M116 91V349M110 91H122M110 349H122"
            stroke="#7aa2ae"
          />
          <text
            x="360"
            y="399"
            textAnchor="middle"
            fill="#bbd4d8"
            fontSize="15"
          >
            45 cm
          </text>
          <text
            x="92"
            y="230"
            transform="rotate(-90 92 230)"
            fill="#bbd4d8"
            fontSize="15"
          >
            30 cm
          </text>
          <text x="30" y="421" fill="#839fab" fontSize="11">
            Ruang servis belakang HOB mengikuti model produsen. Skema tidak
            berskala.
          </text>
        </>
      )}
      {kind === "electric" && (
        <>
          <rect
            x="80"
            y="105"
            width="320"
            height="218"
            fill={`url(#${water})`}
            stroke="#95bec8"
            strokeWidth="2"
          />
          <path d="M80 139H400" stroke="#69d9c2" strokeDasharray="6 5" />
          <rect
            x="115"
            y="81"
            width="62"
            height="62"
            rx="4"
            fill="#233c49"
            stroke="#7e9ca7"
          />
          <text
            x="146"
            y="107"
            textAnchor="middle"
            fill="#cadfe3"
            fontSize="12"
          >
            HOB
          </text>
          <path
            d="M177 105H440V317Q440 365 473 365Q505 365 505 317V207"
            fill="none"
            stroke="#d9b888"
            strokeWidth="4"
          />
          <rect
            x="476"
            y="129"
            width="150"
            height="78"
            rx="8"
            fill="#263947"
            stroke="#bfa578"
          />
          <circle cx="505" cy="166" r="12" fill="#15232e" />
          <circle cx="501" cy="165" r="2" fill="#c2ad87" />
          <circle cx="509" cy="165" r="2" fill="#c2ad87" />
          <text
            x="551"
            y="159"
            textAnchor="middle"
            fill="#e6d5b4"
            fontSize="11"
          >
            Listrik terlindung
          </text>
          <text
            x="555"
            y="176"
            textAnchor="middle"
            fill="#e6d5b4"
            fontSize="11"
          >
            di luar percikan
          </text>
          <text
            x="487"
            y="397"
            textAnchor="middle"
            fill="#e0c79f"
            fontSize="13"
          >
            Drip loop di bawah stopkontak
          </text>
          <text x="110" y="352" fill="#9db8c0" fontSize="12">
            Stand tervalidasi & rata
          </text>
          <text x="30" y="421" fill="#839fab" fontSize="11">
            Skema konsep. Grounding dan RCD harus diperiksa tenaga yang
            kompeten.
          </text>
        </>
      )}
    </svg>
  );
}
