#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { CodeCommitSetupStackDevA } from '../lib/cicd/training-codecommit-devA';
import { CodeCommitSetupStackDevB } from '../lib/cicd/training-codecommit-devB';
import { CodeCommitSetupStackDevC } from '../lib/cicd/training-codecommit-devC';
import { TrainingCodePipelineA } from '../lib/cicd/training-codepipeline-devA';
import { TrainingCodePipelineB } from '../lib/cicd/training-codepipeline-devB';
import { TrainingCodePipelineC } from '../lib/cicd/training-codepipeline-devC';
import { ATRTrainingVPC } from '../lib/atr-training-networking/atr-training-vpc';
import { ATRTrainingInfraDevA } from '../lib/atr-training-infra/atr-training-infra-dev-a';
import { ATRTrainingInfraDevB } from '../lib/atr-training-infra/atr-training-infra-dev-b';
import { ATRTrainingInfraDevC } from '../lib/atr-training-infra/atr-training-infra-dev-c';
import {ATRApiGWStack} from '../lib/atr-apigw/atr-apigw';


const app = new cdk.App();

new CodeCommitSetupStackDevA(app, 'CodeCommitSetupStackDevA', {
    env: {
        account: '354404802106',
        region: 'us-east-1'
      }
});
new CodeCommitSetupStackDevB(app, 'CodeCommitSetupStackDevB', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});
new CodeCommitSetupStackDevC(app, 'CodeCommitSetupStackDevC', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});
new TrainingCodePipelineA(app, 'TrainingCodePipelineA', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});
new TrainingCodePipelineB(app, 'TrainingCodePipelineB', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});
new TrainingCodePipelineC(app, 'TrainingCodePipelineC', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});

new ATRTrainingVPC(app, 'ATRTrainingVPC', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});

new ATRTrainingInfraDevA(app, 'ATRTrainingInfraDevA', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});

new ATRTrainingInfraDevB(app, 'ATRTrainingInfraDevB', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});

new ATRTrainingInfraDevC(app, 'ATRTrainingInfraDevC', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});

new ATRApiGWStack(app, 'ATRApiGWStack', {
  env: {
    account: '354404802106',
    region: 'us-east-1'
  }
});
