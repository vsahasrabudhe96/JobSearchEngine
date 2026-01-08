import type { IJobSource } from './types'
import { MockJobProvider, RemoteOKProvider, ArbeitnowProvider } from './providers'

class JobSourceRegistry {
  private sources: Map<string, IJobSource> = new Map()

  constructor() {
    // Register all available providers
    this.register(new MockJobProvider())
    this.register(new RemoteOKProvider())
    this.register(new ArbeitnowProvider())
  }

  register(source: IJobSource): void {
    this.sources.set(source.id, source)
  }

  get(id: string): IJobSource | undefined {
    return this.sources.get(id)
  }

  getAll(): IJobSource[] {
    return Array.from(this.sources.values())
  }

  getAvailable(): IJobSource[] {
    return this.getAll().filter(source => source.isAvailable())
  }

  getByIds(ids: string[]): IJobSource[] {
    if (ids.length === 0) return this.getAvailable()
    return ids
      .map(id => this.get(id))
      .filter((source): source is IJobSource => source !== undefined && source.isAvailable())
  }
}

export const jobSourceRegistry = new JobSourceRegistry()
