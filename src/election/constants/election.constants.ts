export enum ElectionType {
  PRIMARY = 'primary',
  GENERAL = 'general',
  BYE_ELECTION = 'bye_election',
  LOCAL_GOVERNMENT = 'local_government',
  RE_RUN = 're_run',
  SUPPLEMENTARY = 'supplementary',
  OFF_CIRCLE_GUBERNATORIAL = 'off_cycle_gubernatorial',
}

export enum ElectionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum ElectionLevel {
  POLLING_UNIT = 'polling_unit',
  WARD = 'ward',
  LGA = 'lga',
  STATE = 'state',
  NATIONAL = 'national',
}
