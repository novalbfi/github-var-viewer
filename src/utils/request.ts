import { GITHUB_TOKEN } from "@src/constants/config";
import { octokit } from "./octokit";

export const updateEnvironmentVariable = async (props: {
  name: string;
  updatedName: string;
  updatedValue: string;
  repositoryId: number;
  envName: string;
}) => {
  const { name, updatedName, updatedValue, repositoryId, envName } = props;

  const options = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: updatedName,
      value: updatedValue,
    }),
  };

  await fetch(
    `https://api.github.com/repositories/${repositoryId}/environments/${envName}/variables/${name}`,
    options
  );
};

export const getRepository = async (props: {
  orgName: string;
  repoName: string;
}) => {
  const { data: repository } = await octokit.request(
    "GET /repos/{owner}/{repo}",
    {
      owner: props.orgName,
      repo: props.repoName,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return repository;
};

const getVariablesPerPage = async (props: {
  repositoryId: number;
  envName: string;
  page: number
}) => octokit.request(
  "GET /repositories/{repository_id}/environments/{environment_name}/variables",
  {
    repository_id: props.repositoryId,
    environment_name: props.envName,
    page: props.page,
    per_page: 30,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }
);

export const getVariables = async (props: {
  repositoryId: number;
  envName: string;
}) => {
  try {
    const LIMIT = 30
    let page = 0
    let totalCount = 30 
    let totalPage = Math.ceil(totalCount / LIMIT)
    let variables: {
      name: string;
      value: string;
      created_at: string;
      updated_at: string;
    }[] = []

    while (page < totalPage) {
      page++
      const {
        data: { variables: variablesPerPage, total_count },
      } = await getVariablesPerPage({repositoryId: props.repositoryId, envName: props.envName, page})
      variables = variables.concat(variablesPerPage)
      totalCount = total_count
      totalPage = Math.ceil(totalCount / LIMIT)
    }

    return variables;
  } catch (e) {
    return [];
  }
};
