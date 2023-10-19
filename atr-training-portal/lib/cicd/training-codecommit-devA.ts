import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { CfnOutput } from 'aws-cdk-lib';
import { aws_codecommit as codecommit, aws_codepipeline as codepipeline, aws_codepipeline_actions as cpactions, aws_ecr as ecr, aws_codebuild as codebuild } from 'aws-cdk-lib';

export class CodeCommitSetupStackDevA extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the CodeCommit repository
    const repo = new Repository(this, 'ATRTrainingRepo', {
      repositoryName: 'atr-training-repo-a'
    });

    const ecrRepo = new ecr.Repository(this, 'ATRTraningECRRepo', {
      repositoryName: 'atr-training-ecr-a'
    });

    // Output the repository clone URL
    new CfnOutput(this, 'RepoCloneUrlHttp', {
      value: repo.repositoryCloneUrlHttp,
      description: 'The HTTP URL to clone the repo.'
    });
  }
}
