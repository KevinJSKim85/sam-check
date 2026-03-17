import { PrismaPg } from '@prisma/adapter-pg'
import {
  CredentialType,
  PrismaClient,
  TeachingMode,
  UserRole,
  VerificationStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const SAMPLE_PASSWORD = 'Sam5928!'

async function main() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.message.deleteMany(),
    prisma.credential.deleteMany(),
    prisma.tutorProfile.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ])

  const hashedPassword = await bcrypt.hash(SAMPLE_PASSWORD, 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Sam-Check Admin',
      email: 'admin@samcheck.kr',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.ADMIN,
      locale: 'ko',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Sample Tutor',
      email: 'sample@tutor.sam',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.TUTOR,
      locale: 'ko',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Sample Student',
      email: 'sample@student.sam',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.STUDENT,
      locale: 'ko',
    },
  })

  const tutor1 = await prisma.user.create({
    data: {
      name: 'Emily Carter',
      email: 'emily.harvard@samcheck.kr',
      role: UserRole.TUTOR,
      locale: 'en',
      tutorProfile: {
        create: {
          headline: 'AP Math and Physics specialist for top-tier admissions',
          bio: 'Harvard graduate with structured, score-focused coaching for AP and SAT learners.',
          subjects: ['Math', 'Physics'],
          curricula: ['AP', 'SAT'],
          hourlyRate: 110000,
          teachingMode: TeachingMode.BOTH,
          university: 'Harvard University',
          degree: 'B.S. Applied Mathematics',
          isPublished: true,
          credentials: {
            create: [
              {
                type: CredentialType.SAT,
                label: 'SAT Total Score',
                scoreValue: '1580',
                description: 'Evidence of SAT excellence used for strategy mentoring.',
                status: VerificationStatus.APPROVED,
                verifiedBy: admin.email,
                verificationNote: 'Score report verified against submitted document.',
              },
              {
                type: CredentialType.AP,
                label: 'AP Calculus BC',
                scoreValue: '5',
                description: 'Advanced calculus teaching qualification.',
                status: VerificationStatus.APPROVED,
                verifiedBy: admin.email,
                verificationNote: 'Official AP score document confirmed.',
              },
              {
                type: CredentialType.LANGUAGE_TEST,
                label: 'TOEFL iBT',
                scoreValue: '118',
                description: 'High-proficiency English communication credential.',
                status: VerificationStatus.PENDING,
              },
            ],
          },
        },
      },
    },
    include: { tutorProfile: true },
  })

  const tutor2 = await prisma.user.create({
    data: {
      name: 'Jiwoo Kim',
      email: 'jiwoo.snu@samcheck.kr',
      role: UserRole.TUTOR,
      locale: 'ko',
      tutorProfile: {
        create: {
          headline: 'IB Chemistry and Biology mentor with exam-focused planning',
          bio: 'Seoul National University graduate helping students build strong IA and exam routines.',
          subjects: ['Chemistry', 'Biology'],
          curricula: ['IB'],
          hourlyRate: 90000,
          teachingMode: TeachingMode.ONLINE,
          university: 'Seoul National University',
          degree: 'B.S. Chemistry Education',
          isPublished: true,
          credentials: {
            create: [
              {
                type: CredentialType.SCHOOL_CERT,
                label: 'University Graduation Certificate',
                description: 'Official graduation certificate from SNU.',
                status: VerificationStatus.APPROVED,
                verifiedBy: admin.email,
                verificationNote: 'Degree and issue date matched registrar records.',
              },
              {
                type: CredentialType.EXPERIENCE,
                label: 'Teaching Experience',
                scoreValue: '3 years',
                description: 'Three years of IB tutoring for chemistry and biology.',
                status: VerificationStatus.APPROVED,
                verifiedBy: admin.email,
                verificationNote: 'Reference checks completed.',
              },
            ],
          },
        },
      },
    },
    include: { tutorProfile: true },
  })

  const tutor3 = await prisma.user.create({
    data: {
      name: 'Oliver Bennett',
      email: 'oliver.oxford@samcheck.kr',
      role: UserRole.TUTOR,
      locale: 'en',
      tutorProfile: {
        create: {
          headline: 'Admissions-focused SAT strategist for global applicants',
          bio: 'Oxford graduate guiding students through score improvement and interview readiness.',
          subjects: ['English', 'Critical Reading'],
          curricula: ['SAT', 'Language Tests'],
          hourlyRate: 100000,
          teachingMode: TeachingMode.BOTH,
          university: 'University of Oxford',
          degree: 'B.A. English Language and Literature',
          isPublished: true,
          credentials: {
            create: [
              {
                type: CredentialType.SAT,
                label: 'SAT Total Score',
                scoreValue: '1540',
                description: 'Strong SAT score with reading-heavy strength.',
                status: VerificationStatus.APPROVED,
                verifiedBy: admin.email,
                verificationNote: 'Official SAT report verified.',
              },
              {
                type: CredentialType.LANGUAGE_TEST,
                label: 'DELF B2',
                scoreValue: 'B2',
                description: 'French proficiency credential submitted by tutor.',
                status: VerificationStatus.REJECTED,
                rejectionReason: 'Submitted document was unreadable. Please re-upload a clear scan.',
              },
              {
                type: CredentialType.SCHOOL_CERT,
                label: 'Degree Certificate',
                description: 'Oxford graduation certificate awaiting verification.',
                status: VerificationStatus.PENDING,
              },
            ],
          },
        },
      },
    },
    include: { tutorProfile: true },
  })

  const student1 = await prisma.user.create({
    data: {
      name: 'Minseo Park',
      email: 'minseo.student@samcheck.kr',
      role: UserRole.STUDENT,
      locale: 'ko',
    },
  })

  const student2 = await prisma.user.create({
    data: {
      name: 'Daniel Lee',
      email: 'daniel.student@samcheck.kr',
      role: UserRole.STUDENT,
      locale: 'en',
    },
  })

  await prisma.message.createMany({
    data: [
      {
        senderId: student1.id,
        receiverId: tutor1.id,
        content: 'Hi Emily, are you available for AP Calculus BC prep this weekend?',
        isRead: true,
      },
      {
        senderId: tutor1.id,
        receiverId: student1.id,
        content: 'Yes, I have Saturday 3 PM and Sunday 11 AM slots. Which works for you?',
        isRead: false,
      },
      {
        senderId: student2.id,
        receiverId: tutor2.id,
        content: 'Can you help me improve my IB Chemistry IA structure?',
        isRead: true,
      },
      {
        senderId: tutor2.id,
        receiverId: student2.id,
        content: 'Absolutely. Send your current draft and rubric, and I will review before class.',
        isRead: false,
      },
    ],
  })

  const tutor1ProfileId = tutor1.tutorProfile?.id
  const tutor2ProfileId = tutor2.tutorProfile?.id
  const tutor3ProfileId = tutor3.tutorProfile?.id

  if (!tutor1ProfileId || !tutor2ProfileId || !tutor3ProfileId) {
    throw new Error('Tutor profile creation failed during seed process.')
  }

  await prisma.review.createMany({
    data: [
      {
        tutorProfileId: tutor1ProfileId,
        authorId: student1.id,
        rating: 5,
        content: 'Very clear AP Calculus explanations and excellent homework feedback.',
      },
      {
        tutorProfileId: tutor2ProfileId,
        authorId: student2.id,
        rating: 4,
        content: 'Great IB chemistry support. Labs and IA planning became much easier.',
      },
      {
        tutorProfileId: tutor3ProfileId,
        authorId: student1.id,
        rating: 5,
        content: 'Strong SAT reading strategy sessions and practical interview guidance.',
      },
    ],
  })

  const profileIds = [tutor1ProfileId, tutor2ProfileId, tutor3ProfileId]

  for (const profileId of profileIds) {
    const stats = await prisma.review.aggregate({
      where: { tutorProfileId: profileId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.tutorProfile.update({
      where: { id: profileId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        totalReviews: stats._count.rating,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Seed failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
