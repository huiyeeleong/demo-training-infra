import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_codecommit as codecommit, aws_codepipeline as codepipeline, aws_codepipeline_actions as cpactions, aws_ecr as ecr, aws_codebuild as codebuild } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export class TrainingCodePipelineA extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Reference an existing CodeCommit repository by name
    const repo = codecommit.Repository.fromRepositoryName(this, 'ExistingMyRepository', 'atr-training-repo-a');

    // ECR repository
    const ecrRepo = ecr.Repository.fromRepositoryName(this, 'ExistingECRRepo', 'atr-training-ecr-a');

    const buildOutput = new codepipeline.Artifact('BuildOutput');

    // CodeBuild project
    const buildProject = new codebuild.PipelineProject(this, 'ATRTraningBuild', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml')
    });
    // Grant full ECS permissions to CodeBuild's role
    buildProject.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecs:*'
      ],
      resources: ['*'],
    }));
    
    ecrRepo.grantPullPush(buildProject.grantPrincipal);

    // Create Artifact for SourceOutput
    const sourceOutput = new codepipeline.Artifact('SourceOutput');

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'ATRTraningPipeline', {
      pipelineName: 'ATRTraningPipelineDevA',
      restartExecutionOnUpdate: true
    });

    // Source Stage
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new cpactions.CodeCommitSourceAction({
          actionName: 'CodeCommit_Source',
          repository: repo,
          output: sourceOutput,
          branch: 'master',
        }),
      ],
    });

    // Build & Push to ECR Stage
    pipeline.addStage({
      stageName: 'BuildAndPush',
      actions: [
        new cpactions.CodeBuildAction({
          actionName: 'BuildAndPushAction',
          project: buildProject,
          input: sourceOutput,
          outputs: [new codepipeline.Artifact('BuildOutput')],
        }),
      ],
    });
  
  }
}
