#!/usr/bin/env bash
set -e

aws s3 cp report/cucumber-report.html s3://$AWS_S3_BUCKET/tests-report/computed-fields-plugin/$TRAVIS_PULL_REQUEST/
aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
echo '{"url":"https://'"$AWS_S3_BUCKET"'/tests-report/computed-fields-plugin/'"$TRAVIS_PULL_REQUEST"'/cucumber-report.html"}' > .ci/kuttlefish/data.json
 docker run --rm -it -v "$(pwd)":/mnt alexandrebouthinon/kuttlefish kuttlefish \
    -template /mnt/.ci/kuttlefish/template.md \
    -data /mnt/.ci/kuttlefish/data.json \
    -repo computed-fields-plugin \
    -owner kuzzleio \
    -token $GITHUB_TOK \
    -id $TRAVIS_PULL_REQUEST
