import "dotenv/config";
import { db } from "../lib/db";
import { frameworks, controls, sources } from "./schema";

type FrameworkSeed = {
  slug: string;
  name: string;
  category: string;
  description: string;
  issuer: string;
  sourceUrl: string;
  sampleControls?: { controlId: string; title: string; description: string; domain: string }[];
};

const seeds: FrameworkSeed[] = [
  {
    slug: "soc-2",
    name: "SOC 2",
    category: "Security & Risk",
    description:
      "SOC 2 is a trust services framework for service organizations covering security, availability, processing integrity, confidentiality, and privacy (Trust Services Criteria).",
    issuer: "AICPA",
    sourceUrl: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    sampleControls: [
      { controlId: "CC1.1", title: "Control Environment", description: "The entity demonstrates a commitment to integrity and ethical values.", domain: "Control Environment" },
      { controlId: "CC6.1", title: "Logical and Physical Access", description: "The entity restricts logical and physical access to assets to meet the criteria.", domain: "Common Criteria" },
    ],
  },
  {
    slug: "iso-27001",
    name: "ISO/IEC 27001",
    category: "Security & Risk",
    description:
      "The international standard for an Information Security Management System (ISMS), specifying requirements for establishing, implementing, maintaining, and continually improving information security.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/27001",
    sampleControls: [
      { controlId: "A.5.1", title: "Policies for Information Security", description: "Management shall define an information security policy in line with business requirements.", domain: "Organizational Controls" },
      { controlId: "A.8.2", title: "Information Classification", description: "Information shall be classified according to legal, contractual, and business requirements.", domain: "People Controls" },
    ],
  },
  {
    slug: "iso-27701",
    name: "ISO/IEC 27701",
    category: "Data Privacy",
    description:
      "Privacy Information Management System (PIMS) extension to ISO/IEC 27001 and 27002, providing requirements and guidance for establishing, implementing, maintaining, and continually improving privacy management for organizations acting as PII controllers or PII processors.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/71670.html",
    sampleControls: [
      { controlId: "7.2.2", title: "Identify Lawful Basis", description: "Identify and document the lawful basis for the collection and processing of PII for each purpose.", domain: "Conditions for Collection and Processing" },
      { controlId: "7.4.1", title: "Limit Collection", description: "Limit the collection of PII to that which is necessary to achieve the specified purpose.", domain: "Privacy by Design and by Default" },
      { controlId: "7.5.1", title: "Identify Basis for Transfer", description: "Identify the basis for the transfer of PII between jurisdictions, considering legal requirements.", domain: "PII Sharing, Transfer, and Disclosure" },
    ],
  },
  {
    slug: "iso-42001",
    name: "ISO/IEC 42001",
    category: "AI & Emerging Technology",
    description:
      "The international standard for an Artificial Intelligence Management System (AIMS), specifying requirements to establish, implement, maintain, and continually improve the responsible development, provision, and use of AI systems within organizations.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/81230.html",
    sampleControls: [
      { controlId: "A.2.2", title: "Policy Related to AI", description: "An AI policy shall be established, documented, and aligned with other organizational policies.", domain: "Policies related to AI" },
      { controlId: "A.5.2", title: "Impact Assessment", description: "Assess the impacts of AI systems on individuals, groups, and society before deployment.", domain: "Assessing impacts of AI systems" },
      { controlId: "A.7.5", title: "Data Provenance", description: "Document the origin, history, and provenance of data used across the AI system life cycle.", domain: "Data for AI systems" },
    ],
  },
  {
    slug: "iso-27019",
    name: "ISO/IEC 27019",
    category: "Industry / International",
    description:
      "Information security controls for the energy utility industry, based on ISO/IEC 27002, applied to process control systems (OT) used for the production, generation, transmission, storage, and distribution of electric power, gas, oil, and heat.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/68091.html",
    sampleControls: [
      { controlId: "8.20", title: "Networks Security", description: "Networks within the process control domain shall be managed and controlled, including segmentation between IT and OT environments.", domain: "Technological Controls" },
      { controlId: "8.9", title: "Configuration Management", description: "Configuration of process control systems and field devices shall be established, documented, implemented, monitored, and reviewed.", domain: "Technological Controls" },
      { controlId: "8.16", title: "Monitoring Activities", description: "Systems used in the process control domain shall be monitored to detect anomalies and potential security events.", domain: "Technological Controls" },
    ],
  },
  {
    slug: "nist-csf",
    name: "NIST Cybersecurity Framework",
    category: "Security & Risk",
    description:
      "The NIST CSF 2.0 provides a voluntary framework of standards, guidelines, and best practices to manage and reduce cybersecurity risk across the Functions of Govern, Identify, Protect, Detect, Respond, and Recover.",
    issuer: "NIST",
    sourceUrl: "https://csrc.nist.gov/pubs/cswp/29/the-nist-cybersecurity-framework-csf-2-0",
    sampleControls: [
      { controlId: "GV.OC-01", title: "Mission and Objectives", description: "The organizational mission is understood and informs cybersecurity risk management.", domain: "Govern" },
      { controlId: "PR.AC-01", title: "Identity Management", description: "Identities and credentials are managed for authorized devices, users, and processes.", domain: "Protect" },
    ],
  },
  {
    slug: "nist-sp-800-53",
    name: "NIST SP 800-53",
    category: "Security & Risk",
    description:
      "Security and privacy controls catalog for federal information systems and organizations, providing a comprehensive control baseline used heavily in FedRAMP and FISMA compliance.",
    issuer: "NIST",
    sourceUrl: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
  },
  {
    slug: "cis-controls",
    name: "CIS Critical Security Controls",
    category: "Security & Risk",
    description:
      "A prioritized set of 18 actions to defend organizations and data from known cyberattack vectors, maintained by the Center for Internet Security.",
    issuer: "Center for Internet Security",
    sourceUrl: "https://www.cisecurity.org/controls",
  },
  {
    slug: "hipaa",
    name: "HIPAA",
    category: "Healthcare / Life Sciences",
    description:
      "The Health Insurance Portability and Accountability Act establishes national standards for protecting electronic protected health information (ePHI), including the Security Rule and Privacy Rule.",
    issuer: "HHS / OCR",
    sourceUrl: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C",
    sampleControls: [
      { controlId: "164.308(a)(1)", title: "Security Management Process", description: "Implement policies and procedures to prevent, detect, contain, and correct security violations.", domain: "Administrative Safeguards" },
      { controlId: "164.312(a)(1)", title: "Access Control", description: "Implement technical policies for electronic information systems that maintain ePHI to allow access only to those granted access.", domain: "Technical Safeguards" },
    ],
  },
  {
    slug: "gdpr",
    name: "GDPR",
    category: "Data Privacy",
    description:
      "The EU General Data Protection Regulation governs the processing of personal data of individuals in the EU, establishing rights for data subjects and obligations for controllers and processors.",
    issuer: "European Union",
    sourceUrl: "https://gdpr-info.eu/",
    sampleControls: [
      { controlId: "Art. 25", title: "Data Protection by Design and by Default", description: "Data protection measures shall be integrated into processing activities and business practices by design and by default.", domain: "Data Protection" },
      { controlId: "Art. 32", title: "Security of Processing", description: "Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.", domain: "Security" },
    ],
  },
  {
    slug: "ccpa",
    name: "CCPA / CPRA",
    category: "Data Privacy",
    description:
      "The California Consumer Privacy Act, amended by the California Privacy Rights Act, grants California residents rights over their personal information and imposes obligations on businesses.",
    issuer: "State of California",
    sourceUrl: "https://cppa.ca.gov/regulations/",
  },
  {
    slug: "pipeda",
    name: "PIPEDA",
    category: "Data Privacy",
    description:
      "Canada's Personal Information Protection and Electronic Documents Act governs how private-sector organizations collect, use, and disclose personal information in the course of commercial activity.",
    issuer: "Government of Canada",
    sourceUrl: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/02_05_d_15/",
  },
  {
    slug: "lgpd",
    name: "LGPD",
    category: "Data Privacy",
    description:
      "Brazil's Lei Geral de Proteção de Dados is the national data protection law regulating the processing of personal data, closely modeled on the GDPR.",
    issuer: "Brazil (ANPD)",
    sourceUrl: "https://www.gov.br/cidadania/pt-br/lgpd",
  },
  {
    slug: "pdpa-sg",
    name: "PDPA (Singapore)",
    category: "Data Privacy",
    description:
      "Singapore's Personal Data Protection Act governs the collection, use, and disclosure of personal data by organizations, with a data protection obligations regime.",
    issuer: "PDPC Singapore",
    sourceUrl: "https://www.pdpc.gov.sg/overview-of-pdpa/",
  },
  {
    slug: "dpdpa",
    name: "DPDPA",
    category: "Data Privacy",
    description:
      "India's Digital Personal Data Protection Act, 2023 regulates the processing of digital personal data, establishing consent-based obligations for data fiduciaries and rights for data principals.",
    issuer: "Government of India",
    sourceUrl: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    slug: "pci-dss",
    name: "PCI DSS",
    category: "Financial & Card",
    description:
      "The Payment Card Industry Data Security Standard protects cardholder data for organizations that store, process, or transmit cardholder data, with 12 requirements across 6 control objectives.",
    issuer: "PCI SSC",
    sourceUrl: "https://www.pcisecuritystandards.org/standards/pci-dss/",
    sampleControls: [
      { controlId: "Req 3", title: "Protect Stored Cardholder Data", description: "Protect stored cardholder data through encryption and access control mechanisms.", domain: "Protect Cardholder Data" },
      { controlId: "Req 6", title: "Develop and Maintain Secure Systems", description: "Develop and maintain secure systems and software, including applying security patches promptly.", domain: "Maintain a Vulnerability Management Program" },
    ],
  },
  {
    slug: "sox",
    name: "SOX",
    category: "Financial & Card",
    description:
      "The Sarbanes-Oxley Act requires public companies to maintain effective internal controls over financial reporting (ICFR), including IT general controls.",
    issuer: "US Congress / PCAOB",
    sourceUrl: "https://www.pcaobus.org/oversight/standards/auditing-standards/details/AS2201",
  },
  {
    slug: "glba",
    name: "GLBA",
    category: "Financial & Card",
    description:
      "The Gramm-Leach-Bliley Act requires financial institutions to protect the security and confidentiality of customers' nonpublic personal information through safeguards.",
    issuer: "FTC",
    sourceUrl: "https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act",
  },
  {
    slug: "fda-21-cfr-part-11",
    name: "FDA 21 CFR Part 11",
    category: "Healthcare / Life Sciences",
    description:
      "FDA regulation establishing criteria for electronic records and electronic signatures to be considered trustworthy, equivalent to paper records, in the life sciences industry.",
    issuer: "US FDA",
    sourceUrl: "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11",
  },
  {
    slug: "hitrust",
    name: "HITRUST CSF",
    category: "Healthcare / Life Sciences",
    description:
      "A certifiable framework that harmonizes multiple standards (ISO, NIST, HIPAA, PCI) into a single comprehensive security and privacy framework for the healthcare industry.",
    issuer: "HITRUST",
    sourceUrl: "https://hitrustalliance.net/",
  },
  {
    slug: "fedramp",
    name: "FedRAMP",
    category: "Cloud / Certifications",
    description:
      "The Federal Risk and Authorization Management Program provides a standardized approach to security assessment, authorization, and continuous monitoring for cloud products and services.",
    issuer: "GSA",
    sourceUrl: "https://www.fedramp.gov/",
  },
  {
    slug: "iso-27017",
    name: "ISO/IEC 27017",
    category: "Cloud / Certifications",
    description:
      "Code of practice for information security controls applicable to the provision and use of cloud services, extending ISO/IEC 27002.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/43757.html",
  },
  {
    slug: "iso-27018",
    name: "ISO/IEC 27018",
    category: "Cloud / Certifications",
    description:
      "Code of practice for protection of personally identifiable information (PII) in public clouds acting as PII processors.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/76559.html",
  },
  {
    slug: "nis2",
    name: "NIS2",
    category: "Industry / International",
    description:
      "The EU Directive on measures for a high common level of cybersecurity strengthens security requirements, reporting obligations, and enforcement for essential and important entities.",
    issuer: "European Union",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive",
  },
  {
    slug: "tisax",
    name: "TISAX",
    category: "Industry / International",
    description:
      "Trusted Information Security Assessment Exchange is the automotive industry's standardized information security assessment based on the VDA ISA catalogue.",
    issuer: "ENX / VDA",
    sourceUrl: "https://portal.enx.com/en-US/TISAX/",
  },
  {
    slug: "soc-1",
    name: "SOC 1 (SSAE 18)",
    category: "Industry / International",
    description:
      "Reports on controls at a service organization relevant to user entities' internal control over financial reporting (ICFR), under SSAE 18 / AT-C 320.",
    issuer: "AICPA",
    sourceUrl: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
  },
  {
    slug: "iso-9001",
    name: "ISO 9001",
    category: "Industry / International",
    description:
      "International standard for quality management systems (QMS) specifying requirements to consistently provide products and services that meet customer and regulatory requirements.",
    issuer: "ISO",
    sourceUrl: "https://www.iso.org/standard/62085.html",
  },
  {
    slug: "cobit",
    name: "COBIT",
    category: "Industry / International",
    description:
      "ISACA's framework for the governance and management of enterprise information and technology, mapping goals to processes and controls.",
    issuer: "ISACA",
    sourceUrl: "https://www.isaca.org/resources/cobit",
  },
  {
    slug: "eu-ai-act",
    name: "EU AI Act",
    category: "AI & Emerging Technology",
    description:
      "The EU Artificial Intelligence Act is the first comprehensive legal framework for AI, imposing obligations on providers and deployers based on the risk tier of the AI system.",
    issuer: "European Union",
    sourceUrl: "https://artificialintelligenceact.eu/",
    sampleControls: [
      { controlId: "Art. 9", title: "Risk Management System", description: "Establish a risk management system that identifies, evaluates, and mitigates risks posed by the AI system across its lifecycle.", domain: "High-Risk AI Requirements" },
      { controlId: "Art. 13", title: "Transparency and Provision of Information", description: "Design high-risk AI systems so their operation is sufficiently transparent to enable users to interpret outputs and use them appropriately.", domain: "High-Risk AI Requirements" },
      { controlId: "Art. 14", title: "Human Oversight", description: "Ensure natural persons can effectively oversee high-risk AI systems, including the ability to intervene and override outputs.", domain: "High-Risk AI Requirements" },
    ],
  },
  {
    slug: "dora",
    name: "DORA",
    category: "Financial & Card",
    description:
      "The EU Digital Operational Resilience Act establishes a uniform framework for ICT risk management, incident reporting, digital operational resilience testing, and third-party risk for the financial sector.",
    issuer: "European Union",
    sourceUrl: "https://digital-finance-platform.ec.europa.eu/regulatory-activities/dora",
    sampleControls: [
      { controlId: "Art. 5", title: "ICT Risk Management Framework", description: "Establish a sound and comprehensive ICT risk management framework documented in an internal policy defining responsibilities and control mechanisms.", domain: "ICT Risk Management" },
      { controlId: "Art. 9", title: "Protection and Prevention", description: "Implement ICT protection and prevention tools, policies, and procedures to ensure security of networks, systems, and data.", domain: "ICT Risk Management" },
      { controlId: "Art. 28", title: "Key Third-Party Provider Contracts", description: "Conclude written agreements with ICT third-party providers covering full lifecycle management, exit strategies, and monitoring of subcontractors.", domain: "Third-Party Risk" },
    ],
  },
  {
    slug: "nist-privacy-framework",
    name: "NIST Privacy Framework",
    category: "Data Privacy",
    description:
      "A voluntary framework to help organizations identify and manage privacy risk, built on the Functions of Identify, Govern, Control, Communicate, and Protect.",
    issuer: "NIST",
    sourceUrl: "https://www.nist.gov/privacy-framework",
    sampleControls: [
      { controlId: "GV.PO-P1", title: "Privacy Governance", description: "Establish a governance structure that defines privacy roles, responsibilities, and accountability within the organization.", domain: "Govern" },
      { controlId: "CT.DP-P1", title: "Data Processing Transparency", description: "Communicate data processing purposes and practices to individuals to enable informed decisions.", domain: "Control" },
      { controlId: "CM.PA-P3", title: "Privacy by Design", description: "Integrate privacy considerations into the design of systems, products, and services.", domain: "Control" },
    ],
  },
  {
    slug: "cmmc",
    name: "CMMC",
    category: "Security & Risk",
    description:
      "The Cybersecurity Maturity Model Certification assesses contractors in the US defense industrial base against NIST SP 800-171 requirements across three maturity levels.",
    issuer: "US DoD",
    sourceUrl: "https://dodcio.defense.gov/CMMC/",
    sampleControls: [
      { controlId: "3.1.1", title: "Authorized Access Control", description: "Limit information system access to authorized users, processes, and devices.", domain: "Access Control" },
      { controlId: "3.5.3", title: "Multifactor Authentication", description: "Use multifactor authentication for network access to privileged and non-privileged accounts.", domain: "Identification and Authentication" },
      { controlId: "3.13.1", title: "System and Communications Protection", description: "Monitor, control, and protect organizational communications at the external and internal boundaries.", domain: "System and Communications Protection" },
    ],
  },
  {
    slug: "iso-22301",
    name: "ISO/IEC 22301",
    category: "Industry / International",
    description:
      "The international standard for business continuity management systems (BCMS), specifying requirements to prepare for, respond to, and recover from disruptive incidents.",
    issuer: "ISO/IEC",
    sourceUrl: "https://www.iso.org/standard/75106.html",
    sampleControls: [
      { controlId: "8.4.1", title: "Business Impact Analysis", description: "Assess the impacts over time of disruptions to activities and identify priorities for recovery.", domain: "Operation" },
      { controlId: "8.4.2", title: "Risk Assessment", description: "Assess risks of disruption to prioritized activities and identify acceptable levels of risk.", domain: "Operation" },
      { controlId: "8.5.1", title: "Business Continuity Procedures", description: "Develop procedures to respond to disruptive incidents and recover prioritized activities within required timescales.", domain: "Operation" },
    ],
  },
  {
    slug: "cyber-essentials",
    name: "Cyber Essentials",
    category: "Security & Risk",
    description:
      "A UK-backed certification scheme of five core technical controls designed to protect organizations from the most common internet-borne cyber attacks.",
    issuer: "UK NCSC / IASME",
    sourceUrl: "https://www.ncsc.gov.uk/cyberessentials/overview",
    sampleControls: [
      { controlId: "CE-1", title: "Boundary Firewalls and Internet Gateways", description: "Secure the boundary between the organization's internal network and the internet with properly configured firewalls.", domain: "Technical Controls" },
      { controlId: "CE-4", title: "Access Control", description: "Limit user access to only what is required for their role and manage user accounts with least privilege.", domain: "Technical Controls" },
      { controlId: "CE-5", title: "Security Update Management", description: "Keep software and devices patched against known vulnerabilities.", domain: "Technical Controls" },
    ],
  },
];

async function main() {
  for (const f of seeds) {
    const [framework] = await db
      .insert(frameworks)
      .values({
        slug: f.slug,
        name: f.name,
        category: f.category,
        description: f.description,
        issuer: f.issuer,
        sourceUrl: f.sourceUrl,
      })
      .onConflictDoUpdate({
        target: frameworks.slug,
        set: {
          name: f.name,
          category: f.category,
          description: f.description,
          issuer: f.issuer,
          sourceUrl: f.sourceUrl,
        },
      })
      .returning();

    const fwId = framework?.id ?? (await db.query.frameworks.findFirst({ where: (fw, { eq }) => eq(fw.slug, f.slug) }))!.id;

    if (f.sampleControls) {
      for (const c of f.sampleControls) {
        await db
          .insert(controls)
          .values({
            frameworkId: fwId,
            controlId: c.controlId,
            title: c.title,
            description: c.description,
            domain: c.domain,
          })
          .onConflictDoNothing();
      }
    }

    await db
      .insert(sources)
      .values({ name: f.name, url: f.sourceUrl, type: "html", frameworkId: fwId })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${seeds.length} frameworks.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
