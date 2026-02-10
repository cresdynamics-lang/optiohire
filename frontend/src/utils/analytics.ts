export type RecruitmentAnalyticsRow = {
  total_applicants?: number | null
  total_applicants_shortlisted?: number | null
  total_shortlisted?: number | null
  total_applicants_rejected?: number | null
  total_rejected?: number | null
  total_applicants_flagged_to_hr?: number | null
  total_flagged?: number | null
}

export interface ApplicantMetricsSlice {
  totalApplicants: number
  shortlistedApplicants: number
  flaggedApplicants: number
  rejectedApplicants: number
}

export const EMPTY_APPLICANT_METRICS: ApplicantMetricsSlice = {
  totalApplicants: 0,
  shortlistedApplicants: 0,
  flaggedApplicants: 0,
  rejectedApplicants: 0,
}

export const extractApplicantMetrics = (
  row?: RecruitmentAnalyticsRow | null
): ApplicantMetricsSlice => {
  if (!row) {
    return { ...EMPTY_APPLICANT_METRICS }
  }

  const totalApplicants = row.total_applicants ?? 0
  const shortlisted =
    row.total_applicants_shortlisted ??
    row.total_shortlisted ??
    0
  const rejected =
    row.total_applicants_rejected ??
    row.total_rejected ??
    0
  const flagged =
    row.total_applicants_flagged_to_hr ??
    row.total_flagged ??
    0

  return {
    totalApplicants,
    shortlistedApplicants: shortlisted,
    rejectedApplicants: rejected,
    flaggedApplicants: flagged,
  }
}

export const hasApplicantMetricsData = (slice: ApplicantMetricsSlice): boolean =>
  slice.totalApplicants > 0 ||
  slice.shortlistedApplicants > 0 ||
  slice.flaggedApplicants > 0 ||
  slice.rejectedApplicants > 0

export const combineApplicantMetrics = (
  baseline: ApplicantMetricsSlice,
  addition: ApplicantMetricsSlice
): ApplicantMetricsSlice => ({
  totalApplicants: baseline.totalApplicants + addition.totalApplicants,
  shortlistedApplicants: baseline.shortlistedApplicants + addition.shortlistedApplicants,
  flaggedApplicants: baseline.flaggedApplicants + addition.flaggedApplicants,
  rejectedApplicants: baseline.rejectedApplicants + addition.rejectedApplicants,
})

type ApplicantRecord = { status: string | null | undefined }

export const deriveMetricsFromApplicantStatuses = (
  applicants: ApplicantRecord[]
): ApplicantMetricsSlice => {
  if (!applicants || applicants.length === 0) {
    return { ...EMPTY_APPLICANT_METRICS }
  }

  return applicants.reduce<ApplicantMetricsSlice>((acc, applicant) => {
    acc.totalApplicants += 1

    switch (applicant.status) {
      case 'shortlisted':
        acc.shortlistedApplicants += 1
        break
      case 'flagged':
        acc.flaggedApplicants += 1
        break
      case 'rejected':
        acc.rejectedApplicants += 1
        break
      default:
        break
    }

    return acc
  }, { ...EMPTY_APPLICANT_METRICS })
}

