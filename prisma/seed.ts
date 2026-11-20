import {
  AssignmentRole,
  AttachmentKind,
  AvailabilityStatus,
  Priority,
  ReferenceSourceType,
  ResearchStatus,
  ReviewDecision,
  RevisionSeverity,
  RevisionStatus,
  Role,
  SubmissionStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = { id: string; name: string };

type SeedReference = {
  title: string;
  url: string;
  sourceType: ReferenceSourceType;
  publisher: string;
  relevanceNote: string;
  isPrimary: boolean;
};

type SeedTopic = {
  id: string;
  title: string;
  description: string;
  objective: string;
  relevanceNote: string;
  status: ResearchStatus;
  priority: Priority;
  startDate: Date;
  deadline: Date;
  completedAt?: Date;
  primary: SeedUser | null;
  backup: SeedUser | null;
  categories: string[];
  references: SeedReference[];
};

function dateOnly(offsetDays: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function at(offsetDays: number, hour = 10): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

async function main() {
  console.log("🌱 Seeding NEXORA — East Side Central Research...");

  const department = await prisma.department.upsert({
    where: { slug: "research" },
    update: { name: "Research" },
    create: { name: "Research", slug: "research" },
  });

  const categorySeed = [
    { name: "Ekonomi & Pasar", slug: "ekonomi-pasar", color: "#0ea5e9" },
    { name: "Kebijakan Publik", slug: "kebijakan-publik", color: "#6366f1" },
    { name: "Sosial & Demografi", slug: "sosial-demografi", color: "#ec4899" },
    { name: "Teknologi & Digital", slug: "teknologi-digital", color: "#8b5cf6" },
    { name: "Lingkungan & Energi", slug: "lingkungan-energi", color: "#10b981" },
    { name: "Geopolitik & Keamanan", slug: "geopolitik-keamanan", color: "#f59e0b" },
  ];

  const categories = new Map<string, { id: string }>();
  for (const category of categorySeed) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, color: category.color },
      create: category,
    });
    categories.set(category.slug, row);
  }

  const userSeed = [
    {
      key: "fauzan",
      name: "Fauzan Aditya",
      email: "fauzan@eastsidecentral.org",
      role: Role.MANAGER,
      availability: AvailabilityStatus.AVAILABLE,
      availabilityNote: "Head of Research",
    },
    {
      key: "nadia",
      name: "Nadia Prameswari",
      email: "nadia@eastsidecentral.org",
      role: Role.ANALYST,
      availability: AvailabilityStatus.AVAILABLE,
      availabilityNote: "Fokus riset ekonomi & pasar",
    },
    {
      key: "rizky",
      name: "Rizky Pratama",
      email: "rizky@eastsidecentral.org",
      role: Role.ANALYST,
      availability: AvailabilityStatus.BUSY_EXAM,
      availabilityNote: "Ujian akhir semester — respons lebih lambat",
    },
    {
      key: "salsabila",
      name: "Salsabila Rahma",
      email: "salsabila@eastsidecentral.org",
      role: Role.ANALYST,
      availability: AvailabilityStatus.AVAILABLE,
      availabilityNote: "Fokus riset sosial & teknologi",
    },
    {
      key: "bagas",
      name: "Bagas Nugroho",
      email: "bagas@eastsidecentral.org",
      role: Role.ANALYST,
      availability: AvailabilityStatus.UNAVAILABLE,
      availabilityNote: "Cuti akademik hingga akhir bulan",
    },
  ];

  const users = new Map<string, { id: string; name: string }>();
  for (const user of userSeed) {
    const row = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        availability: user.availability,
        availabilityNote: user.availabilityNote,
        availabilityUpdatedAt: new Date(),
        isActive: true,
        departmentId: department.id,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        availability: user.availability,
        availabilityNote: user.availabilityNote,
        availabilityUpdatedAt: new Date(),
        isActive: true,
        departmentId: department.id,
      },
    });
    users.set(user.key, row);
  }

  const manager = users.get("fauzan")!;
  const nadia = users.get("nadia")!;
  const rizky = users.get("rizky")!;
  const salsabila = users.get("salsabila")!;

  const topicSeed: SeedTopic[] = [
    {
      id: "a1000000-0000-4000-8000-000000000001",
      title: "Peta Daya Beli Gen Z di Kota Bandung",
      description:
        "Riset ini memetakan pola pengeluaran, prioritas konsumsi, dan sensitivitas harga Generasi Z di Kota Bandung. Latar belakangnya adalah pergeseran perilaku belanja dari ritel fisik ke kanal digital serta meningkatnya biaya hidup pascapandemi. Hasil riset akan digunakan untuk menyusun rekomendasi program literasi finansial dan kemitraan dengan pelaku UMKM lokal.",
      objective:
        "Mengidentifikasi segmen daya beli Gen Z Bandung dan merumuskan tiga rekomendasi program yang dapat dijalankan ESC bersama mitra lokal.",
      relevanceNote:
        "Isu ini relevan dengan agenda ESC tentang inklusi keuangan muda dan menjadi bahan utama diskusi panel kuartal IV.",
      status: ResearchStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      startDate: dateOnly(-6),
      deadline: dateOnly(4),
      primary: nadia,
      backup: salsabila,
      categories: ["ekonomi-pasar", "sosial-demografi"],
      references: [
        {
          title: "Statistik Konsumsi Rumah Tangga Kota Bandung 2025",
          url: "https://bandung.bps.go.id/id/statistics-table?subject=konsumsi",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "BPS Kota Bandung",
          relevanceNote: "Baseline pengeluaran per kapita untuk triangulasi survei.",
          isPrimary: true,
        },
        {
          title: "Perilaku Belanja Digital Generasi Z Indonesia",
          url: "https://databoks.katadata.co.id/",
          sourceType: ReferenceSourceType.NEWS,
          publisher: "Katadata Databoks",
          relevanceNote: "Konteks adopsi e-commerce dan dompet digital.",
          isPrimary: false,
        },
      ],
    },
    {
      id: "a1000000-0000-4000-8000-000000000002",
      title: "Dampak Subsidi Energi terhadap Ketahanan UMKM",
      description:
        "Kajian ini mengevaluasi bagaimana perubahan kebijakan subsidi energi memengaruhi struktur biaya operasional UMKM padat energi, khususnya sektor makanan, tekstil, dan logistik. Riset mencakup simulasi kenaikan biaya, wawancara pemilik usaha, dan perbandingan dengan daerah lain yang menerapkan kebijakan serupa.",
      objective:
        "Mengukur elastisitas biaya operasional UMKM terhadap perubahan harga energi dan menyusun rekomendasi mitigasi.",
      relevanceNote:
        "Pembahasan RAPBN dan revisi tarif energi membuat isu ini sangat time-sensitive. Diperlukan brief singkat untuk pimpinan minggu ini.",
      status: ResearchStatus.IN_REVIEW,
      priority: Priority.URGENT,
      startDate: dateOnly(-14),
      deadline: dateOnly(1),
      primary: rizky,
      backup: nadia,
      categories: ["kebijakan-publik", "ekonomi-pasar"],
      references: [
        {
          title: "Laporan Ketahanan UMKM Indonesia 2025",
          url: "https://www.kemenkopukm.go.id/",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "Kementerian Koperasi dan UKM",
          relevanceNote: "Data jumlah UMKM dan kontribusi terhadap PDB.",
          isPrimary: true,
        },
        {
          title: "Analisis Dampak Subsidi Energi terhadap Inflasi",
          url: "https://www.sciencedirect.com/",
          sourceType: ReferenceSourceType.JOURNAL,
          publisher: "Energy Policy",
          relevanceNote: "Kerangka metodologis untuk simulasi elastisitas.",
          isPrimary: false,
        },
        {
          title: "Pemerintah Bahas Revisi Tarif Energi",
          url: "https://www.antaranews.com/",
          sourceType: ReferenceSourceType.NEWS,
          publisher: "Antara News",
          relevanceNote: "Update kebijakan terbaru per pekan ini.",
          isPrimary: false,
        },
      ],
    },
    {
      id: "a1000000-0000-4000-8000-000000000003",
      title: "Tren Adopsi AI Generatif di Sektor Pendidikan",
      description:
        "Riset eksploratif tentang adopsi alat AI generatif oleh guru dan mahasiswa di Jawa Barat. Fokusnya meliputi pola penggunaan, persepsi risiko akademik, kesenjangan akses, dan kesiapan kebijakan kampus. Pendekatan yang digunakan adalah survei daring dan wawancara mendalam dengan 12 informan.",
      objective:
        "Memetakan pola adopsi AI generatif dan merumuskan kerangka kebijakan penggunaan yang bertanggung jawab.",
      relevanceNote:
        "Topik ini akan menjadi input untuk program literasi AI ESC dan diskusi dengan mitra kampus.",
      status: ResearchStatus.TO_DO,
      priority: Priority.MEDIUM,
      startDate: dateOnly(2),
      deadline: dateOnly(16),
      primary: salsabila,
      backup: rizky,
      categories: ["teknologi-digital", "sosial-demografi"],
      references: [
        {
          title: "UNESCO Guidance for Generative AI in Education",
          url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "UNESCO",
          relevanceNote: "Kerangka etika dan tata kelola AI di pendidikan.",
          isPrimary: true,
        },
      ],
    },
    {
      id: "a1000000-0000-4000-8000-000000000004",
      title: "Kerangka Regulasi Data Pribadi di ASEAN",
      description:
        "Studi komparatif kebijakan perlindungan data pribadi di lima negara ASEAN. Riset membandingkan cakupan regulasi, mekanisme penegakan, dan implikasi bagi organisasi riset yang mengelola data lintas negara. Output berupa matriks kepatuhan dan rekomendasi kebijakan internal.",
      objective:
        "Menyusun matriks kepatuhan data pribadi ASEAN dan rekomendasi kebijakan internal ESC.",
      relevanceNote:
        "Relevan untuk rencana ekspansi riset lintas negara dan kebutuhan due diligence mitra.",
      status: ResearchStatus.DONE,
      priority: Priority.HIGH,
      startDate: dateOnly(-32),
      deadline: dateOnly(-4),
      completedAt: at(-3, 15),
      primary: nadia,
      backup: rizky,
      categories: ["geopolitik-keamanan", "kebijakan-publik"],
      references: [
        {
          title: "ASEAN Data Protection Frameworks Comparison",
          url: "https://asean.org/",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "ASEAN Secretariat",
          relevanceNote: "Perbandingan rezim perlindungan data antarnegara.",
          isPrimary: true,
        },
        {
          title: "Undang-Undang Perlindungan Data Pribadi Indonesia",
          url: "https://peraturan.bpk.go.id/",
          sourceType: ReferenceSourceType.INTERNAL,
          publisher: "BPK RI",
          relevanceNote: "Baseline kepatuhan nasional.",
          isPrimary: false,
        },
      ],
    },
    {
      id: "a1000000-0000-4000-8000-000000000005",
      title: "Kesiapan Infrastruktur Hijau Kawasan Industri",
      description:
        "Penilaian kesiapan kawasan industri di Jawa Barat terhadap transisi energi dan standar lingkungan. Riset mencakup pemetaan infrastruktur, wawancara pengelola kawasan, dan analisis celah terhadap target transisi energi nasional.",
      objective:
        "Mengidentifikasi celah infrastruktur hijau dan prioritas investasi di tiga kawasan industri.",
      relevanceNote:
        "Isu ini mendesak karena ada permintaan brief dari mitra industri untuk forum ESG bulan depan.",
      status: ResearchStatus.REVISION_NEEDED,
      priority: Priority.HIGH,
      startDate: dateOnly(-12),
      deadline: dateOnly(-1),
      primary: rizky,
      backup: salsabila,
      categories: ["lingkungan-energi", "kebijakan-publik"],
      references: [
        {
          title: "Peta Jalan Transisi Energi Nasional",
          url: "https://www.esdm.go.id/",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "Kementerian ESDM",
          relevanceNote: "Target dan tahapan transisi energi.",
          isPrimary: true,
        },
      ],
    },
    {
      id: "a1000000-0000-4000-8000-000000000006",
      title: "Survei Persepsi Publik terhadap Program Makan Bergizi",
      description:
        "Survei persepsi publik terhadap implementasi program makan bergizi di sekolah. Riset akan mengukur tingkat kesadaran, dukungan, dan kekhawatiran orang tua terkait kualitas, anggaran, dan tata kelola program. Metode yang direncanakan adalah survei panel daring dan diskusi kelompok terarah.",
      objective:
        "Mengukur persepsi publik dan mengidentifikasi faktor yang paling memengaruhi dukungan terhadap program.",
      relevanceNote:
        "Masih dalam tahap perencanaan; perlu penanggung jawab sebelum kick-off.",
      status: ResearchStatus.TO_DO,
      priority: Priority.MEDIUM,
      startDate: dateOnly(1),
      deadline: dateOnly(9),
      primary: null,
      backup: null,
      categories: ["sosial-demografi", "kebijakan-publik"],
      references: [
        {
          title: "Survei Nasional Program Makan Bergizi",
          url: "https://www.litbang.kemkes.go.id/",
          sourceType: ReferenceSourceType.REPORT,
          publisher: "Kemenkes RI",
          relevanceNote: "Data awal cakupan dan indikator kesehatan.",
          isPrimary: true,
        },
      ],
    },
  ];

  for (const topic of topicSeed) {
    const topicRow = await prisma.researchTopic.upsert({
      where: { id: topic.id },
      update: {
        departmentId: department.id,
        title: topic.title,
        description: topic.description,
        objective: topic.objective,
        relevanceNote: topic.relevanceNote,
        status: topic.status,
        priority: topic.priority,
        startDate: topic.startDate,
        deadline: topic.deadline,
        createdById: manager.id,
        backupAnalystId: topic.backup?.id ?? null,
        completedAt: topic.completedAt ?? null,
        archivedAt: null,
        version: 1,
      },
      create: {
        id: topic.id,
        departmentId: department.id,
        title: topic.title,
        description: topic.description,
        objective: topic.objective,
        relevanceNote: topic.relevanceNote,
        status: topic.status,
        priority: topic.priority,
        startDate: topic.startDate,
        deadline: topic.deadline,
        createdById: manager.id,
        backupAnalystId: topic.backup?.id ?? null,
        completedAt: topic.completedAt ?? null,
      },
    });

    await prisma.researchTopicCategory.deleteMany({ where: { topicId: topicRow.id } });
    await prisma.researchTopicCategory.createMany({
      data: topic.categories.map((slug) => ({
        topicId: topicRow.id,
        categoryId: categories.get(slug)!.id,
      })),
    });

    await prisma.researchAssignment.deleteMany({ where: { topicId: topicRow.id } });
    if (topic.primary) {
      await prisma.researchAssignment.create({
        data: {
          topicId: topicRow.id,
          userId: topic.primary.id,
          role: AssignmentRole.PRIMARY,
          assignedById: manager.id,
          assignedAt: at(-7, 9),
        },
      });
    }
    if (topic.backup) {
      await prisma.researchAssignment.create({
        data: {
          topicId: topicRow.id,
          userId: topic.backup.id,
          role: AssignmentRole.BACKUP,
          assignedById: manager.id,
          assignedAt: at(-7, 9),
          note: "Backup untuk antisipasi ketersediaan.",
        },
      });
    }

    await prisma.researchReference.deleteMany({ where: { topicId: topicRow.id } });
    await prisma.researchReference.createMany({
      data: topic.references.map((reference) => ({
        topicId: topicRow.id,
        addedById: topic.primary?.id ?? manager.id,
        title: reference.title,
        url: reference.url,
        sourceType: reference.sourceType,
        publisher: reference.publisher,
        relevanceNote: reference.relevanceNote,
        isPrimary: reference.isPrimary,
      })),
    });

    await prisma.researchStatusHistory.deleteMany({ where: { topicId: topicRow.id } });
    const history: {
      fromStatus: ResearchStatus | null;
      toStatus: ResearchStatus;
      changedById: string;
      note: string;
      createdAt: Date;
    }[] = [
      {
        fromStatus: null,
        toStatus: ResearchStatus.TO_DO,
        changedById: manager.id,
        note: "Topik riset dibuat.",
        createdAt: at(-8, 9),
      },
    ];

    if (topic.status !== ResearchStatus.TO_DO) {
      history.push({
        fromStatus: ResearchStatus.TO_DO,
        toStatus: ResearchStatus.IN_PROGRESS,
        changedById: topic.primary?.id ?? manager.id,
        note: "Pengerjaan dimulai.",
        createdAt: at(-6, 10),
      });
    }
    const reviewStatuses: ResearchStatus[] = [
      ResearchStatus.IN_REVIEW,
      ResearchStatus.REVISION_NEEDED,
      ResearchStatus.DONE,
    ];
    if (reviewStatuses.includes(topic.status)) {
      history.push({
        fromStatus: ResearchStatus.IN_PROGRESS,
        toStatus: ResearchStatus.IN_REVIEW,
        changedById: topic.primary?.id ?? manager.id,
        note: "Hasil riset diajukan untuk review.",
        createdAt: at(-2, 14),
      });
    }
    if (topic.status === ResearchStatus.REVISION_NEEDED) {
      history.push({
        fromStatus: ResearchStatus.IN_REVIEW,
        toStatus: ResearchStatus.REVISION_NEEDED,
        changedById: manager.id,
        note: "Perlu perbaikan pada bagian analisis dan sitasi.",
        createdAt: at(-1, 11),
      });
    }
    if (topic.status === ResearchStatus.DONE) {
      history.push({
        fromStatus: ResearchStatus.IN_REVIEW,
        toStatus: ResearchStatus.DONE,
        changedById: manager.id,
        note: "Disetujui oleh Head of Research.",
        createdAt: at(-3, 15),
      });
    }

    await prisma.researchStatusHistory.createMany({
      data: history.map((item) => ({ ...item, topicId: topicRow.id })),
    });
  }

  const dodTemplate = await prisma.dodTemplate.upsert({
    where: { id: "b1000000-0000-4000-8000-000000000001" },
    update: {
      name: "Standar Riset ESC",
      description: "Kriteria kualitas minimum sebelum riset dinyatakan selesai.",
      departmentId: department.id,
      isDefault: true,
      isActive: true,
    },
    create: {
      id: "b1000000-0000-4000-8000-000000000001",
      name: "Standar Riset ESC",
      description: "Kriteria kualitas minimum sebelum riset dinyatakan selesai.",
      departmentId: department.id,
      isDefault: true,
      isActive: true,
      createdById: manager.id,
    },
  });

  await prisma.dodTemplateItem.deleteMany({ where: { templateId: dodTemplate.id } });
  const dodItems = await Promise.all(
    [
      "Pertanyaan riset dan ruang lingkup jelas",
      "Metodologi dan sumber data terdokumentasi",
      "Temuan divalidasi minimal dua sumber",
      "Implikasi kebijakan/bisnis dirumuskan",
      "Laporan lolos pemeriksaan editorial",
    ].map((label, index) =>
      prisma.dodTemplateItem.create({
        data: {
          templateId: dodTemplate.id,
          label,
          isRequired: true,
          sortOrder: index + 1,
        },
      }),
    ),
  );

  const topicIds = {
    genZ: "a1000000-0000-4000-8000-000000000001",
    energi: "a1000000-0000-4000-8000-000000000002",
    ai: "a1000000-0000-4000-8000-000000000003",
    data: "a1000000-0000-4000-8000-000000000004",
    hijau: "a1000000-0000-4000-8000-000000000005",
    makan: "a1000000-0000-4000-8000-000000000006",
  } as const;

  const firstTopicId = topicIds.genZ;

  async function applyChecklist(
    topicId: string,
    checkedCount: number,
    checkedById: string,
  ): Promise<void> {
    await prisma.dodChecklist.deleteMany({ where: { topicId } });
    const checklist = await prisma.dodChecklist.create({
      data: {
        topicId,
        templateId: dodTemplate.id,
        appliedById: manager.id,
      },
    });
    await prisma.dodChecklistItem.createMany({
      data: dodItems.map((item, index) => ({
        checklistId: checklist.id,
        templateItemId: item.id,
        label: item.label,
        isRequired: true,
        isChecked: index < checkedCount,
        checkedById: index < checkedCount ? checkedById : null,
        checkedAt: index < checkedCount ? at(-1, 13) : null,
        sortOrder: index + 1,
      })),
    });
  }

  await applyChecklist(firstTopicId, 3, nadia.id);
  await applyChecklist(topicIds.energi, 5, rizky.id);
  await applyChecklist(topicIds.data, 5, nadia.id);
  await applyChecklist(topicIds.hijau, 4, rizky.id);

  // Data demo Sprint 2: submission, review, dan catatan revisi.
  await prisma.revisionNote.deleteMany({
    where: { topicId: { in: topicSeed.map((topic) => topic.id) } },
  });
  await prisma.researchReview.deleteMany({
    where: { submission: { topicId: { in: topicSeed.map((topic) => topic.id) } } },
  });
  await prisma.researchSubmission.deleteMany({
    where: { topicId: { in: topicSeed.map((topic) => topic.id) } },
  });

  await prisma.researchSubmission.create({
    data: {
      id: "c1000000-0000-4000-8000-000000000001",
      topicId: topicIds.energi,
      submittedById: rizky.id,
      version: 1,
      summary:
        "Simulasi biaya menunjukkan kenaikan harga energi 15% menaikkan biaya operasional UMKM makanan sebesar 8,4% dan UMKM logistik sebesar 11,2%. Dampak paling besar dirasakan usaha dengan margin di bawah 12%. Rekomendasi utama: skema kompensasi bertahap, penguatan efisiensi energi, dan pendampingan pembiayaan bagi UMKM padat energi.",
      status: SubmissionStatus.PENDING_REVIEW,
      submittedAt: at(-1, 16),
      createdAt: at(-1, 16),
      attachments: {
        create: [
          {
            kind: AttachmentKind.LINK,
            label: "Dokumen utama",
            url: "https://docs.google.com/document/d/dampak-subsidi-energi-umkm",
          },
          {
            kind: AttachmentKind.LINK,
            label: "Matriks simulasi biaya",
            url: "https://docs.google.com/spreadsheets/d/simulasi-biaya-umkm",
          },
        ],
      },
    },
  });

  await prisma.researchSubmission.create({
    data: {
      id: "c1000000-0000-4000-8000-000000000002",
      topicId: topicIds.data,
      submittedById: nadia.id,
      version: 1,
      summary:
        "Matriks kepatuhan menunjukkan Indonesia, Malaysia, dan Filipina memiliki rezim perlindungan data yang relatif matang, sementara Laos dan Kamboja masih dalam tahap penguatan regulasi. Rekomendasi internal mencakup pemetaan aliran data lintas negara, penunjukan data protection officer, dan klausul due diligence pada kemitraan riset.",
      status: SubmissionStatus.APPROVED,
      submittedAt: at(-5, 10),
      reviewedById: manager.id,
      reviewedAt: at(-3, 15),
      createdAt: at(-5, 10),
      attachments: {
        create: [
          {
            kind: AttachmentKind.LINK,
            label: "Dokumen utama",
            url: "https://docs.google.com/document/d/kerangka-regulasi-data-asean",
          },
        ],
      },
      reviews: {
        create: [
          {
            id: "e1000000-0000-4000-8000-000000000001",
            reviewerId: manager.id,
            decision: ReviewDecision.APPROVED,
            summary:
              "Analisis komparatif solid dan rekomendasi internal dapat langsung ditindaklanjuti. Disetujui untuk dipublikasikan sebagai laporan internal.",
            createdAt: at(-3, 15),
          },
        ],
      },
    },
  });

  const greenSubmission = await prisma.researchSubmission.create({
    data: {
      id: "c1000000-0000-4000-8000-000000000003",
      topicId: topicIds.hijau,
      submittedById: rizky.id,
      version: 1,
      summary:
        "Pemetaan awal tiga kawasan industri menunjukkan celah pada penyediaan energi terbarukan, pengelolaan limbah, dan sertifikasi bangunan hijau. Prioritas investasi diusulkan pada modernisasi jaringan dan insentif efisiensi energi. Namun perbandingan antar-kawasan dan sitasi target kebijakan masih perlu diperkuat.",
      status: SubmissionStatus.REVISION_REQUESTED,
      submittedAt: at(-3, 9),
      reviewedById: manager.id,
      reviewedAt: at(-1, 11),
      createdAt: at(-3, 9),
      attachments: {
        create: [
          {
            kind: AttachmentKind.LINK,
            label: "Dokumen utama",
            url: "https://docs.google.com/document/d/kesiapan-infrastruktur-hijau",
          },
        ],
      },
      reviews: {
        create: [
          {
            id: "e1000000-0000-4000-8000-000000000002",
            reviewerId: manager.id,
            decision: ReviewDecision.REVISION_REQUESTED,
            summary:
              "Arah analisis sudah tepat, tetapi kedalaman pembandingan dan ketertelusuran sitasi belum memenuhi standar. Mohon lengkapi dua kawasan pembanding dan perbaiki rujukan target transisi energi sebelum brief ke mitra industri.",
            createdAt: at(-1, 11),
          },
        ],
      },
    },
  });

  await prisma.revisionNote.createMany({
    data: [
      {
        id: "f1000000-0000-4000-8000-000000000001",
        topicId: topicIds.hijau,
        submissionId: greenSubmission.id,
        reviewId: "e1000000-0000-4000-8000-000000000002",
        authorId: manager.id,
        section: "Analisis & Temuan",
        note: "Bagian analisis celah infrastruktur masih bertumpu pada satu kawasan. Tambahkan perbandingan dengan minimal dua kawasan lain dan jelaskan kriteria pemilihan kawasan.",
        severity: RevisionSeverity.HIGH,
        status: RevisionStatus.OPEN,
        createdAt: at(-1, 11),
      },
      {
        id: "f1000000-0000-4000-8000-000000000002",
        topicId: topicIds.hijau,
        submissionId: greenSubmission.id,
        reviewId: "e1000000-0000-4000-8000-000000000002",
        authorId: manager.id,
        section: "Referensi & Sitasi",
        note: "Klaim target transisi energi belum memiliki sitasi halaman. Lengkapi rujukan ke Peta Jalan Transisi Energi Nasional beserta tahun terbit dan tautan resminya.",
        severity: RevisionSeverity.BLOCKING,
        status: RevisionStatus.OPEN,
        createdAt: at(-1, 11),
      },
      {
        id: "f1000000-0000-4000-8000-000000000003",
        topicId: topicIds.hijau,
        submissionId: greenSubmission.id,
        reviewId: "e1000000-0000-4000-8000-000000000002",
        authorId: manager.id,
        section: "Metodologi",
        note: "Jelaskan teknik pemilihan informan dan periode wawancara agar temuan dapat direplikasi oleh tim lain.",
        severity: RevisionSeverity.MEDIUM,
        status: RevisionStatus.RESOLVED,
        resolvedById: rizky.id,
        resolvedAt: at(-1, 16),
        createdAt: at(-1, 11),
      },
    ],
  });

  console.log(
    "   Sprint 2: 1 submission menunggu review, 1 approved, 1 revisi dengan catatan.",
  );

  if ((await prisma.auditLog.count()) === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: manager.id,
          action: "RESEARCH_TOPIC_CREATED",
          entityType: "ResearchTopic",
          entityId: firstTopicId,
          metadata: { title: "Peta Daya Beli Gen Z di Kota Bandung" },
          createdAt: at(-8, 9),
        },
        {
          actorId: manager.id,
          action: "ANALYST_ASSIGNED",
          entityType: "ResearchTopic",
          entityId: firstTopicId,
          metadata: { analyst: nadia.name, role: "PRIMARY" },
          createdAt: at(-7, 9),
        },
      ],
    });
  }

  console.log("✅ Seed selesai.");
  console.log(`   Manager : Fauzan Aditya <fauzan@eastsidecentral.org>`);
  console.log(`   Analyst : Nadia, Rizky, Salsabila, Bagas`);
  console.log(`   Topik   : ${topicSeed.length} topik riset`);
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
