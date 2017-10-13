package com.text.parser;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.LineIterator;

/**
 * 梁云-895423140@qq.com 文件操作都是以File类来进行操作， 所谓的后缀也都是文件的绝对路径的末尾文字; 如后缀：
 * xml;.xml;abc.xml;js;.js;abc.js;
 * 
 * @author sudy-liangyun
 *
 */
public class Wx2Ant {
	private ArrayList<String> suffix = new ArrayList<>();
	private ArrayList<String> toSuffix = new ArrayList<>();
	private ArrayList<String> methods = new ArrayList<>();
	private ArrayList<String> toMethods = new ArrayList<>();
	private ArrayList<String> JSRegexp = new ArrayList<>();
	private ArrayList<String> JSToRegexp = new ArrayList<>();
	private ArrayList<String> AXMLRegexp = new ArrayList<>();
	private ArrayList<String> AXMLToRegexp = new ArrayList<>();
	private ArrayList<String> JSONRegexp = new ArrayList<>();
	private ArrayList<String> JSONToRegexp = new ArrayList<>();
	private String dir = "";
	/**
	 * 将符合后缀的文件copy和修改后缀名为指定的后缀。e.g.
	 * addUpdateSuffix(".wxml",".axml");将会copy指定目录下所有的.wxml后缀的文件为.axml后缀的文件
	 */
	public static final int UPDATAANDCOPY = 1;
	/**
	 * 删除指定后缀的文件 e.g. addUpdateSuffix("abc.xml")将会删除指定目录下所有的abc.xml
	 */
	public static final int DELETEFILE = 2;
	/**
	 * 将符合后缀的文件替换为指定的后缀 e.g.
	 * addUpdateSuffix(".wxml",".axml");将会修改指定目录下所有的.wxml为.axml
	 */
	public static final int UPDATESUFFIX = 3;
	/**
	 * 微信小程序转阿里小程序 js文件主要是进行库名的修改，即'wx.'-->'my.'
	 * 方法名替换使用addUpdateMethods()添加更换的方法 e.g.
	 * addUpdateMethods("request","httpRequest") 将request转换成httpRequest
	 * axml文件主要进行 属性名称的修改，即'wx:'-->'a:'
	 */
	public static final int WX2ANT = 4;

	private int order = WX2ANT;

	public static void main(String[] args) {

		Wx2Ant us = new Wx2Ant();
		System.out.println("工作目录：" + System.getProperty("user.dir"));
		String configPath = System.getProperty("user.dir") + File.separator + "wx2ali.txt";
		// String configPath = "z:/wx2ali.txt";
		us.readConfig(configPath);
		us.addUpdateSuffix("wxml", "axml");// 这边的order是UPDATESUFFIX 所以是修改后缀名
											// wxml->axml
		us.addUpdateSuffix("wxss", "acss");// wxss->acss
		us.setOrder(UPDATESUFFIX);
		us.HandleFile(us.dir);
		us.clearSuffix();
		us.addUpdateSuffix(".axml");
		us.addUpdateSuffix(".acss");
		us.addUpdateSuffix(".json");
		// 动作
		us.setOrder(WX2ANT);
		us.HandleFile(us.dir);
	}

	// -----------------------------------
	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	// -----------------------------------
	public void addUpdateMethods(String method) {
		addUpdateSuffix(method, "");
	}

	public void addUpdateMethods(String method, String toMethod) {
		this.methods.add(method);
		this.toMethods.add(toMethod);
	}

	public void clearMethod() {
		this.methods.clear();
		this.toMethods.clear();
	}

	// ----------------------------------- 要更新的后缀
	public void addUpdateSuffix(String s) {
		addUpdateSuffix(s, "");
	}

	public void addUpdateSuffix(String suffix, String toSuffix) {
		this.suffix.add(suffix);
		this.toSuffix.add(toSuffix);
	}

	public void clearSuffix() {
		this.suffix.clear();
		this.toSuffix.clear();
	}

	// ----------------------------------- js要更新的正则表达式
	public void addJSRegexp(String s) {
		addJSRegexp(s, "");
	}

	public void addJSRegexp(String suffix, String toSuffix) {
		this.JSRegexp.add(suffix);
		this.JSToRegexp.add(toSuffix);
	}

	public void clearJSRegexp() {
		this.JSRegexp.clear();
		this.JSToRegexp.clear();
	}

	// ----------------------------------- amxl要更新的正则表达式
	public void addAXMLRegexp(String s) {
		addAXMLRegexp(s, "");
	}

	public void addAXMLRegexp(String suffix, String toSuffix) {
		this.AXMLRegexp.add(suffix);
		this.AXMLToRegexp.add(toSuffix);
	}

	public void clearAXMLRegexp() {
		this.AXMLRegexp.clear();
		this.AXMLToRegexp.clear();
	}

	// ----------------------------------- json要更新的正则表达式
	public void addJSONRegexp(String s) {
		addAXMLRegexp(s, "");
	}

	public void addJSONRegexp(String suffix, String toSuffix) {
		this.JSONRegexp.add(suffix);
		this.JSONToRegexp.add(toSuffix);
	}

	public void clearJSONRegexp() {
		this.JSONRegexp.clear();
		this.JSONToRegexp.clear();
	}
	// -----------------------------------

	private void HandleFile(Object src) {
		File f = null;
		if (src instanceof String) {
			f = new File((String) src);
		} else if (src instanceof File) {
			f = (File) src;
		} else {
			return;
		}
		if (f.exists()) {
			if (f.isDirectory()) {
				File[] af = f.listFiles();
				for (int i = 0; i < af.length; i++) {
					HandleFile(af[i]);
				}
			} else if (f.isFile() && (isValid(f) != -1)) {
				switch (order) {
				case UPDATAANDCOPY:
					updataAndCopy(f);
					break;
				case DELETEFILE:
					deleteFile(f);
					break;
				case UPDATESUFFIX:
					updataSuffix(f);
					break;
				case WX2ANT:
					wx2ant(f);
					break;
				default:
					System.out.println("没有该种处理文件的方式");
					break;
				}
			}
		}
		return;
	}

	private int isValid(File f) {
		for (int i = 0; i < suffix.size(); i++) {
			if (f.getAbsolutePath().endsWith(suffix.get(i))) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * 将符合后缀的文件copy和修改后缀名为指定的后缀。e.g.
	 * addUpdateSuffix(".wxml",".axml");将会copy指定目录下所有的.wxml后缀的文件为.axml后缀的文件
	 * 
	 * @param f
	 */
	private void updataAndCopy(File f) {
		int index = isValid(f);
		String newfile = f.getAbsolutePath().replaceFirst(suffix.get(index) + "$", toSuffix.get(index));
		try {
			FileUtils.copyFile(f, new File(newfile));
			System.out.println("文件复制：" + newfile);
		} catch (FileNotFoundException e) {
			System.out.println("文件复制出错：" + e.getMessage());
		} catch (IOException e) {
			System.out.println("文件复制出错：" + e.getMessage());
		}
	}

	/**
	 * 将符合后缀的文件替换为指定的后缀 e.g.
	 * addUpdateSuffix(".wxml",".axml");将会修改指定目录下所有的.wxml为.axml
	 * 
	 * @param f
	 */
	private void updataSuffix(File f) {
		int index = isValid(f);
		String newfile = f.getAbsolutePath().replaceFirst(suffix.get(index) + "$", toSuffix.get(index));
		try {
			f.renameTo(new File(newfile));
			System.out.println("文件修改后缀名：" + newfile);
		} catch (Exception e) {
			System.out.println("文件修改后缀名出错：" + newfile + "--" + e.getMessage());
		}
	}

	/**
	 * 删除指定后缀的文件 e.g. addUpdateSuffix("abc.xml")将会删除指定目录下所有的abc.xml
	 * 
	 * @param f
	 */
	private void deleteFile(File f) {
		String path = f.getAbsolutePath();
		try {
			f.delete();
		} catch (Exception e) {
			System.out.println(path + "文件删除出错：" + e.getMessage());
		}
		System.out.println("文件删除成功:" + path);
	}

	/**
	 * 微信小程序转阿里小程序 js文件主要是进行库名的修改，即'wx.'-->'my.'
	 * 方法名替换使用addUpdateMethods()添加更换的方法 e.g.
	 * addUpdateMethods("request","httpRequest") 将request转换成httpRequest
	 * axml文件主要进行 属性名称的修改，即'wx:'-->'a:'
	 * 
	 * @param f
	 */
	private void wx2ant(File f) {
		if (f.getAbsolutePath().endsWith(".js")) {
			String preffix = "(^|\\W+)wx\\.";
			String toPreffix = "$1my.";
			try {
				String file = FileUtils.readFileToString(f, "utf-8");
				for (int i = 0; i < methods.size(); i++) {// 修改不一样的方法
					file = file.replaceAll(preffix + methods.get(i), toPreffix + toMethods.get(i));
				}
				for (int i = 0; i < JSRegexp.size(); i++) {// 修改不一样的方法
					file = file.replaceAll(JSRegexp.get(i), JSToRegexp.get(i));
				}
				file = file.replaceAll(preffix, toPreffix);// 统一修改未进行方法替换的前缀
				FileUtils.writeStringToFile(f, file, "utf-8");
				System.out.println("转换js文件：" + f.getAbsolutePath());
			} catch (IOException e) {
				System.out.println("转换js文件出错：" + f.getAbsolutePath() + "--" + e.getMessage());
			}
		} else if (f.getAbsolutePath().endsWith(".axml")) {
			try {
				String s = FileUtils.readFileToString(f, "utf-8");
				for (int i = 0; i < AXMLRegexp.size(); i++) {// 修改不一样的方法
					s = s.replaceAll(AXMLRegexp.get(i), AXMLToRegexp.get(i));
				}
				FileUtils.writeStringToFile(f, s, "utf-8");
				System.out.println("转换axml文件：" + f.getAbsolutePath());
			} catch (IOException e) {
				System.out.println("转换axml文件出错：" + f.getAbsolutePath() + "--" + e.getMessage());
			}
		} else if (f.getAbsolutePath().endsWith(".json")) {
			try {
				String s = FileUtils.readFileToString(f, "utf-8");
				for (int i = 0; i < JSONRegexp.size(); i++) {// 修改不一样的方法
					s = s.replaceAll(JSONRegexp.get(i), JSONToRegexp.get(i));
				}
				FileUtils.writeStringToFile(f, s, "utf-8");
				System.out.println("转换json文件：" + f.getAbsolutePath());
			} catch (IOException e) {
				System.out.println("转换json文件出错：" + f.getAbsolutePath() + "--" + e.getMessage());
			}
		}
	}

	public void readConfig(String configPath) {
		try {
			LineIterator li = FileUtils.lineIterator(new File(configPath), "utf-8");
			int state = 0;
			while (li.hasNext()) {
				String l = li.nextLine();
				l = l.replaceAll("#.*$", "").trim();
				if (state == 0) {
					if ("JSmethod".equals(l)) {
						state = 1;
					} else if ("JS".equals(l)) {
						state = 2;
					} else if ("AXML".equals(l)) {
						state = 3;
					} else if ("JSON".equals(l)) {
						state = 4;
					} else if ("DIR".equals(l)) {
						state = 5;
					}
				} else if ("end".equals(l)) {
					state = 0;
				} else if (state == 1) {
					String[] aTob = l.split("--->");
					this.addUpdateMethods(aTob[0], aTob[1]);
				} else if (state == 2) {
					String[] aTob = l.split("--->");
					this.addJSRegexp(aTob[0], aTob[1]);
				} else if (state == 3) {
					String[] aTob = l.split("--->");
					this.addAXMLRegexp(aTob[0], aTob[1]);
				} else if (state == 4) {
					String[] aTob = l.split("--->");
					this.addJSONRegexp(aTob[0], aTob[1]);
				} else if (state == 5) {
					dir = l;
					System.out.println("切换到修改文件路径：" + l);
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
