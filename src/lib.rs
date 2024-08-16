use swc_core::ecma::{
    ast::Program,
    ast::{Str},
    transforms::testing::test_inline,
    visit::{as_folder, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use regex::Regex;
use serde::Deserialize;
use serde_json::from_str;

#[derive(Default, Deserialize)]
struct Config {
    matches: Vec<String>,
}

struct RemoveInvalidContent {
    matchers: Vec<Regex>,
}

impl RemoveInvalidContent {
    fn new(config: Config) -> RemoveInvalidContent {
        Self {
            matchers: config.matches.iter().map(|x| Regex::new(x.as_str()).unwrap()).collect(),
        }
    }
}

impl VisitMut for RemoveInvalidContent {
    fn visit_mut_str(&mut self, node: &mut Str) {
        for matcher in self.matchers.iter() {
            let new_value = matcher.replace_all(&node.value, "");

            let new_node = Str::from(new_value);

            node.clone_from(&new_node);
        }

        node.visit_mut_children_with(self);
    }
}


#[plugin_transform]
pub fn process_transform(mut program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config = from_str::<Option<Config>>(
        &data
            .get_transform_plugin_config()
            .expect("failed to get plugin config for remove-invalid-content-plugin"),
    )
        .expect("invalid packages")
        .unwrap_or(Config::default());

    program.visit_mut_with(&mut RemoveInvalidContent::new(config));

    program
}


test_inline!(
    Default::default(),
    |_| as_folder(RemoveInvalidContent::new(Config{
        matches: vec![r"[\u4E00-\u9FFF]".to_string()]
    })),
    should_not_change,
    r#"console.log("transform");"#,
    r#"console.log("transform");"#
);

test_inline!(
    Default::default(),
    |_| as_folder(RemoveInvalidContent::new(Config{
        matches: vec![r"[\u4E00-\u9FFF]".to_string()]
    })),
    should_remove_in_method_calls,
    r#"console.log("transform中文");"#,
    r#"console.log("transform");"#
);

test_inline!(
    Default::default(),
    |_| as_folder(RemoveInvalidContent::new(
        Config{
        matches: vec![r"[\u4E00-\u9FFF]".to_string()]
    }
    )),
    should_remove_in_object_property,
    r#"const a = {
      cde: {
        code: 1,
        message: "视频下载错误",
        description:
          "只要视频下载错误就使用此类型",
      }
     }"#,
    r#"const a = {
      cde: {
        code: 1,
        message: "",
        description: "",
      }
     }"#
);

test_inline!(
    Default::default(),
    |_| as_folder(RemoveInvalidContent::new(
        Config{
        matches: vec![r"[\u4E00-\u9FFF]".to_string()]
    }
    )),
    should_left_english_and_special_characters,
    r#"const a = {
      abc: {
        code: 1,
        message: "视频下载错误",
        description:
          "只要视频下载xhr错误就使用，此类型",
      }
     }"#,
    r#"const a = {
      abc: {
        code: 1,
        message: "",
        description: "xhr，",
      }
     }"#
);

test_inline!(
    Default::default(),
    |_| as_folder(RemoveInvalidContent::new(Config{
        matches: vec![r"abc.com|cde.org".to_string()]
    })),
    should_remove_url,
    r#"console.log("https://abc.com/faker-url");"#,
    r#"console.log("https:///faker-url");"#
);