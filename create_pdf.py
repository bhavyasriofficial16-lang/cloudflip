import os

class SimplePDF:
    def __init__(self, filename):
        self.filename = filename
        self.pages = []
        self.current_page_commands = []
        self.current_y = 790
        self.page_width = 595.28
        self.page_height = 841.89
        self.margin_left = 45
        self.margin_right = 550
        self.line_width = 505

    def new_page(self):
        if self.current_page_commands:
            self.pages.append(list(self.current_page_commands))
            self.current_page_commands = []
        self.current_y = 790

    def draw_line(self, x1, y1, x2, y2, color=(0,0,0), width=1):
        r, g, b = color
        self.current_page_commands.append(f"{r:.3f} {g:.3f} {b:.3f} RG {width:.2f} w {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def draw_rect(self, x, y, w, h, fill_color=None, stroke_color=None, stroke_width=1):
        cmds = []
        if fill_color:
            r, g, b = fill_color
            cmds.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        if stroke_color:
            r, g, b = stroke_color
            cmds.append(f"{r:.3f} {g:.3f} {b:.3f} RG {stroke_width:.2f} w")
        
        op = "B" if (fill_color and stroke_color) else ("f" if fill_color else "S")
        cmds.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")
        self.current_page_commands.append(" ".join(cmds))

    def wrap_text(self, text, max_chars=95):
        words = text.split(" ")
        lines = []
        cur = []
        cur_len = 0
        for w in words:
            if cur_len + len(w) + 1 <= max_chars:
                cur.append(w)
                cur_len += len(w) + 1
            else:
                lines.append(" ".join(cur))
                cur = [w]
                cur_len = len(w)
        if cur:
            lines.append(" ".join(cur))
        return lines

    def clean_unicode(self, text):
        return (text.replace("\u2014", "-")
                    .replace("\u2013", "-")
                    .replace("\u2019", "'")
                    .replace("\u2018", "'")
                    .replace("\u201c", '"')
                    .replace("\u201d", '"')
                    .replace("\u00d7", "x"))

    def add_text_line(self, text, font="F1", size=10, color=(0.1, 0.1, 0.1), x=None, y=None):
        if x is None:
            x = self.margin_left
        if y is None:
            y = self.current_y
        r, g, b = color
        clean_text = self.clean_unicode(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        cmd = f"BT /{font} {size} Tf {r:.3f} {g:.3f} {b:.3f} rg {x:.2f} {y:.2f} Td ({clean_text}) Tj ET"
        self.current_page_commands.append(cmd)

    def add_paragraph(self, text, font="F3", size=9.5, leading=13.5, color=(0.12, 0.12, 0.12), max_chars=96, indent=0):
        lines = self.wrap_text(text, max_chars)
        for line in lines:
            self.add_text_line(line, font=font, size=size, color=color, x=self.margin_left + indent, y=self.current_y)
            self.current_y -= leading

    def add_bullet(self, bold_prefix, text, font="F3", bold_font="F4", size=9, leading=12.5, max_chars=92):
        full_text = bold_prefix + " " + text
        lines = self.wrap_text(full_text, max_chars)
        
        # Bullet dash
        self.add_text_line("-", font="F1", size=9, color=(0.0, 0.2, 0.4), x=self.margin_left + 10, y=self.current_y)
        
        for line in lines:
            self.add_text_line(line, font=font, size=size, color=(0.12, 0.12, 0.12), x=self.margin_left + 22, y=self.current_y)
            self.current_y -= leading

    def build(self):
        if self.current_page_commands:
            self.pages.append(list(self.current_page_commands))

        objs = []
        num_pages = len(self.pages)
        page_obj_ids = [9 + 2*i for i in range(num_pages)]
        content_obj_ids = [10 + 2*i for i in range(num_pages)]

        objs.append("<< /Type /Catalog /Pages 3 0 R >>")
        objs.append("<< /Type /Outlines /Count 0 >>")
        kids_str = " ".join(f"{pid} 0 R" for pid in page_obj_ids)
        objs.append(f"<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>")

        for i in range(num_pages):
            pid = page_obj_ids[i]
            cid = content_obj_ids[i]
            page_obj = f"<< /Type /Page /Parent 3 0 R /MediaBox [0 0 {self.page_width:.2f} {self.page_height:.2f}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R /F5 8 0 R >> >> /Contents {cid} 0 R >>"
            objs.append(page_obj)

            stream_body = "\n".join(self.pages[i])
            stream_len = len(stream_body.encode("latin1"))
            stream_obj = f"<< /Length {stream_len} >>\nstream\n{stream_body}\nendstream"
            objs.append(stream_obj)

        with open(self.filename, "wb") as f:
            f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
            offsets = []
            for i, o in enumerate(objs, 1):
                offsets.append(f.tell())
                f.write(f"{i} 0 obj\n{o}\nendobj\n".encode("latin1"))
            
            xref_pos = f.tell()
            f.write(f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n".encode("latin1"))
            for off in offsets:
                f.write(f"{off:010d} 00000 n \n".encode("latin1"))
            
            f.write(f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin1"))

def main():
    out_pdf = "/Users/admin/Desktop/cloudflip/Bhavya_Sri_Boddeti_NUS_IRIS_Personal_Statement.pdf"
    pdf = SimplePDF(out_pdf)

    # ==================== PAGE 1 ====================
    pdf.add_text_line("PERSONAL STATEMENT", font="F2", size=17, color=(0.0, 0.2, 0.4), x=195, y=795)
    pdf.draw_line(45, 786, 550, 786, color=(0.0, 0.2, 0.4), width=1.8)

    # Header Metadata Box
    pdf.draw_rect(45, 715, 505, 64, fill_color=(0.95, 0.965, 0.98), stroke_color=(0.75, 0.8, 0.86), stroke_width=0.7)
    pdf.draw_rect(45, 715, 4, 64, fill_color=(0.0, 0.2, 0.4))

    pdf.add_text_line("Applicant: Bhavya Sri Boddeti", font="F2", size=9, color=(0.1, 0.1, 0.1), x=55, y=765)
    pdf.add_text_line("Cumulative CGPA: 8.79 / 10.0 (Semesters 1-4)", font="F2", size=9, color=(0.1, 0.1, 0.1), x=340, y=765)

    pdf.add_text_line("Degree: Bachelor of Computer Applications (BCA)", font="F1", size=8.5, color=(0.2, 0.2, 0.2), x=55, y=751)
    pdf.add_text_line("Institution: St. Ann's College for Women (Autonomous)", font="F1", size=8.5, color=(0.2, 0.2, 0.2), x=340, y=751)

    pdf.add_text_line("Target Program: NUS IRIS 2026 (Research Immersion)", font="F1", size=8.5, color=(0.2, 0.2, 0.2), x=55, y=737)
    pdf.add_text_line("Host Institution: National University of Singapore (NUS)", font="F1", size=8.5, color=(0.2, 0.2, 0.2), x=340, y=737)

    pdf.add_text_line("Focus Areas: AI-Driven Cloud Infrastructure, Predictive Autoscaling & Real-Time Intelligent Systems", font="F1", size=8, color=(0.0, 0.25, 0.45), x=55, y=723)

    pdf.current_y = 698

    # Section 1
    pdf.add_text_line("1. Introduction & Research Philosophy", font="F2", size=11, color=(0.0, 0.2, 0.4))
    pdf.draw_line(45, 694, 550, 694, color=(0.85, 0.88, 0.92), width=0.8)
    pdf.current_y = 680

    pdf.add_paragraph(
        "My ambition as a computer science student lies in designing intelligent, reliable systems that bridge the gap between real-time telemetry processing and automated decision-making. Throughout my Bachelor of Computer Applications (BCA) degree at St. Ann's College for Women, I have maintained an intense drive to go beyond conventional coursework by building production-grade software applications and conducting independent research. My work spans predictive cloud capacity forecasting, enterprise NLP pipelines, real-time audio signal processing, and IoT telemetry architectures-demonstrating my ability to translate mathematical models into robust software systems.",
        font="F3", size=9.5, leading=13.5, max_chars=96
    )

    pdf.current_y -= 4

    # Section 2
    pdf.add_text_line("2. Flagship Research Project: CloudFlip.ai", font="F2", size=11, color=(0.0, 0.2, 0.4))
    pdf.draw_line(45, pdf.current_y - 4, 550, pdf.current_y - 4, color=(0.85, 0.88, 0.92), width=0.8)
    pdf.current_y -= 16

    pdf.add_paragraph(
        "My primary research endeavor during my BCA program is CloudFlip.ai, an independent research project focused on predictive cloud infrastructure scaling and closed-loop performance verification using machine learning telemetry forecasting.",
        font="F3", size=9.5, leading=13.5, max_chars=96
    )

    pdf.current_y -= 3

    pdf.add_bullet(
        "The Problem & Innovation:",
        "Traditional cloud auto-scaling mechanisms (such as standard AWS CloudWatch triggers) are fundamentally reactive. They initiate fleet expansions only after CPU utilization breaches critical thresholds, introducing multi-minute server boot delays and causing latency spikes during sudden flash surges. To address this limitation, I formulated a predictive scaling model using Exponential Moving Average (EMA) smoothing combined with discrete first-derivative acceleration slope forecasting to anticipate resource overloads 15 to 30 minutes prior to occurrence.",
        font="F3", size=9, leading=12.5, max_chars=92
    )

    pdf.current_y -= 2

    pdf.add_bullet(
        "Architecture & Engineering:",
        "I engineered a dynamic mathematical simulation backend using Python FastAPI, AWS Boto3 SDK, PostgreSQL, Docker, and a live React/TypeScript telemetry dashboard. The system enforces a Closed-Loop Scale-Down Policy that maintains strict 180ms SLA latency bounds while automatically stepping fleet size down to baseline capacity during idle periods.",
        font="F3", size=9, leading=12.5, max_chars=92
    )

    pdf.current_y -= 2

    pdf.add_bullet(
        "Zenodo Publication (DOI: 10.5281/zenodo.23136467):",
        "This work culminated in an authored research paper deposited on Zenodo. Under a simulated 6x flash-surge evaluation scenario, the architecture achieved a reduction in p99 latency from 4,200 ms to 180 ms and decreased HTTP error rates from 3.8% to 0.1%.",
        font="F3", size=9, leading=12.5, max_chars=92
    )

    # Footer Page 1
    pdf.draw_line(45, 45, 550, 45, color=(0.85, 0.85, 0.85), width=0.5)
    pdf.add_text_line("NUS IRIS 2026 Application | Personal Statement - Bhavya Sri Boddeti", font="F1", size=7.5, color=(0.5, 0.5, 0.5), x=45, y=34)
    pdf.add_text_line("Page 1 of 2", font="F1", size=7.5, color=(0.5, 0.5, 0.5), x=505, y=34)

    # ==================== PAGE 2 ====================
    pdf.new_page()

    # Header Page 2
    pdf.add_text_line("NUS IRIS 2026 - Personal Statement | Bhavya Sri Boddeti", font="F1", size=8, color=(0.4, 0.4, 0.4), x=45, y=805)
    pdf.draw_line(45, 797, 550, 797, color=(0.85, 0.85, 0.85), width=0.5)
    pdf.current_y = 778

    # Section 3
    pdf.add_text_line("3. Applied Systems & Engineering Projects (Completed During BCA)", font="F2", size=11, color=(0.0, 0.2, 0.4))
    pdf.draw_line(45, 774, 550, 774, color=(0.85, 0.88, 0.92), width=0.8)
    pdf.current_y = 760

    pdf.add_paragraph(
        "Complementing my cloud research, I conceptualized and built three full-stack and applied AI applications during my BCA degree, illustrating technical breadth across natural language processing, real-time signal processing, and hardware-software telemetry:",
        font="F3", size=9.5, leading=13.5, max_chars=96
    )

    pdf.current_y -= 2

    # ResolveIQ
    pdf.add_text_line("A. ResolveIQ - Enterprise Customer Complaint Analytics Platform", font="F2", size=9.5, color=(0.1, 0.1, 0.1))
    pdf.add_text_line("(Live: https://resolveiq-complaint-analyzer.streamlit.app/)", font="F5", size=8, color=(0.0, 0.35, 0.6), x=360, y=pdf.current_y)
    pdf.current_y -= 13

    pdf.add_bullet(
        "Multi-Format NLP Engine:",
        "Developed an automated NLP ingestion pipeline accepting .pdf, .csv, and .xlsx files to extract, clean, and structure high-volume customer feedback datasets for e-commerce and logistics operations.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )
    pdf.add_bullet(
        "Urgency & Sentiment Routing:",
        "Built an analytics dashboard that automatically categorizes incoming tickets by sentiment scores and urgency levels, enabling high-priority automated ticket routing for enterprise support teams.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )
    pdf.add_bullet(
        "LLM Decision Support:",
        "Integrated an LLM-driven decision-support chatbot interface providing automated, real-time resolution recommendations and answering operational support queries.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )

    pdf.current_y -= 3

    # SwaraSense
    pdf.add_text_line("B. SwaraSense - Real-Time Indian Classical Music Note Detection PWA", font="F2", size=9.5, color=(0.1, 0.1, 0.1))
    pdf.add_text_line("(Live: https://swarasense-web.netlify.app/)", font="F5", size=8, color=(0.0, 0.35, 0.6), x=395, y=pdf.current_y)
    pdf.current_y -= 13

    pdf.add_bullet(
        "Real-Time Signal Processing:",
        "Designed a real-time swara (note) detection engine using FastAPI on the backend and React + Vite on the frontend, deployed as a Progressive Web App (PWA).",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )
    pdf.add_bullet(
        "Interactive Visualization:",
        "Engineered a responsive holographic-style visualization mapping detected swara frequencies to corresponding body region diagrams for interactive musical education.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )

    pdf.current_y -= 3

    # Plant IQ
    pdf.add_text_line("C. Plant IQ - IoT-Enabled Environmental Monitoring & Security System", font="F2", size=9.5, color=(0.1, 0.1, 0.1))
    pdf.current_y -= 13

    pdf.add_bullet(
        "IoT Hardware & Sensors:",
        "Developed an end-to-end monitoring ecosystem utilizing microcontrollers and environmental sensors to track soil moisture, humidity, and temperature parameters in real time.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )
    pdf.add_bullet(
        "Native iOS & Low-Latency Alerts:",
        "Engineered a native iOS mobile app with real-time Bluetooth/Wi-Fi telemetry updates, dynamic dashboards, and proximity motion-sensor push notifications.",
        font="F3", size=8.8, leading=12.2, max_chars=93
    )

    pdf.current_y -= 4

    # Section 4
    pdf.add_text_line("4. Why NUS IRIS & Academic Alignment", font="F2", size=11, color=(0.0, 0.2, 0.4))
    pdf.draw_line(45, pdf.current_y - 4, 550, pdf.current_y - 4, color=(0.85, 0.88, 0.92), width=0.8)
    pdf.current_y -= 16

    pdf.add_paragraph(
        "The National University of Singapore (NUS) stands at the forefront of global research in computer science, software engineering, and intelligent systems. The NUS IRIS program offers the ideal environment for me to immerse myself in world-class research laboratories, collaborate with faculty mentors, and contribute to cutting-edge computing paradigms under the School of Computing (SoC):",
        font="F3", size=9, leading=12.6, max_chars=96
    )
    pdf.add_bullet("Distributed Systems & Cloud Computing:", "Autonomous resource provisioning, serverless capacity management, and SLA-aware scheduling algorithms.", font="F3", size=8.8, leading=12.0, max_chars=93)
    pdf.add_bullet("AI for Systems & IoT Telemetry:", "Telemetry-driven anomaly detection, edge computing architectures, and real-time optimization loops.", font="F3", size=8.8, leading=12.0, max_chars=93)
    pdf.add_bullet("Dependable & Reliable Software Systems:", "Automated performance verification, dynamic workload modeling, and autonomic system control.", font="F3", size=8.8, leading=12.0, max_chars=93)

    pdf.current_y -= 4

    # Section 5
    pdf.add_text_line("5. Future Academic Goals & Conclusion", font="F2", size=11, color=(0.0, 0.2, 0.4))
    pdf.draw_line(45, pdf.current_y - 4, 550, pdf.current_y - 4, color=(0.85, 0.88, 0.92), width=0.8)
    pdf.current_y -= 16

    pdf.add_paragraph(
        "My long-term academic goal is to pursue a research-focused Master of Philosophy (MPhil) and Ph.D. in Computer Science, specializing in autonomic cloud systems and distributed intelligence. My undergraduate trajectory at St. Ann's College for Women-marked by a cumulative CGPA of 8.79/10.0, an authored Zenodo research paper, and four complete software platforms across cloud, AI, web, and IoT-reflects my dedication, technical autonomy, and readiness for rigorous academic research. Participating in the NUS IRIS program will be a pivotal step in my research career.",
        font="F3", size=9, leading=12.6, max_chars=96
    )

    pdf.current_y -= 4

    # Signature Block
    pdf.draw_line(45, pdf.current_y, 550, pdf.current_y, color=(0.8, 0.8, 0.8), width=0.5)
    pdf.current_y -= 12
    pdf.add_text_line("Bhavya Sri Boddeti  |  Visakhapatnam, Andhra Pradesh, India  |  bhavyasriboddeti16@gmail.com", font="F2", size=8, color=(0.2, 0.2, 0.2))
    pdf.current_y -= 11
    pdf.add_text_line("LinkedIn: https://www.linkedin.com/in/bhavya-sri-b0a33637a  |  GitHub: https://github.com/bhavyasriofficial16-lang", font="F1", size=7.5, color=(0.35, 0.35, 0.35))

    # Footer Page 2
    pdf.draw_line(45, 45, 550, 45, color=(0.85, 0.85, 0.85), width=0.5)
    pdf.add_text_line("NUS IRIS 2026 Application | Personal Statement - Bhavya Sri Boddeti", font="F1", size=7.5, color=(0.5, 0.5, 0.5), x=45, y=34)
    pdf.add_text_line("Page 2 of 2", font="F1", size=7.5, color=(0.5, 0.5, 0.5), x=505, y=34)

    pdf.build()
    print("SUCCESS! PDF built at:", out_pdf, "Size:", os.path.getsize(out_pdf), "bytes")

if __name__ == "__main__":
    main()
