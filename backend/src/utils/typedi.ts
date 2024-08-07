import Container from 'typedi'
import type { DB, Env } from '../index'

export const getEnv = () => Container.get<Env>('env')
export const getDB = () => Container.get<DB>('DrizzleDB')
