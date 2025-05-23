import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role: any, subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  if (role === 150) {
    can('manage', 'all')
  } else if (role === 160) {
    can(['read', 'manage'], 'all')
  } else if (role === 170) {
    can('manage', 'all')
    can(['read', 'manage'], 'all')
  } else if (role === 200) {
    can(['read', 'manage'], 'all')
  } else if (role === 210) {
    can(['read', 'manage'], 'all')
  } else if (role === 220) {
    can(['read', 'manage'], 'all')
  } else if (role === 230) {
    can(['read', 'manage'], 'all')
  } else if (role === 240) {
    can(['read', 'manage'], 'all')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'ms-ds-admin'
}

export default defineRulesFor
