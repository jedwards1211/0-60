// @flow

import superagent from 'superagent'
import { defaults, once, keyBy, map } from 'lodash'
import getCircleCIConfig from './getCircleCIConfig'

type Options = {
  apiVersion?: ?string,
  token?: ?string,
}

type Project = {
  vcsType?: string,
  username: string,
  project: string,
}

type EnvironmentVariable = {
  name: string,
  value: string,
}

class CircleCIClient {
  options: {
    apiVersion: string,
    token?: ?string,
  }
  baseUrl: string
  query: { [string]: string }

  constructor(_options: Options) {
    const options = (this.options = defaults(_options, { apiVersion: '1.1' }))
    this.baseUrl = `https://circleci.com/api/v${options.apiVersion}`
    const { token } = options
    this.query = token ? { 'circle-token': token } : {}
  }

  projectUrl({ vcsType, username, project }: Project): string {
    if (!vcsType) vcsType = 'github'
    return `${this.baseUrl}/project/${vcsType}/${username}/${project}`
  }

  async followProject(project: Project): Promise<Object> {
    const { body } = await superagent
      .post(`${this.projectUrl(project)}/follow`)
      .accept('json')
      .query(this.query)
    return body
  }

  async listEnvironmentVariables(
    project: Project
  ): Promise<{ [string]: string }> {
    const { body } = await superagent
      .get(`${this.projectUrl(project)}/envvar`)
      .accept('json')
      .type('json')
      .query(this.query)
    return keyBy(body, 'name')
  }

  async addEnvironmentVariable(
    project: Project,
    variable: EnvironmentVariable
  ): Promise<EnvironmentVariable> {
    const { body } = await superagent
      .post(`${this.projectUrl(project)}/envvar`)
      .accept('json')
      .type('json')
      .query(this.query)
      .send(variable)
    return body
  }

  async addEnvironmentVariables(
    project: Project,
    variables: { [string]: string }
  ): Promise<Array<EnvironmentVariable>> {
    return await Promise.all(
      map(variables, (value, name) =>
        this.addEnvironmentVariable(project, { name, value })
      )
    )
  }
}

export default once(async () => new CircleCIClient(await getCircleCIConfig()))
